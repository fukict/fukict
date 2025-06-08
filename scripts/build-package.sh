#!/bin/bash

# 可用的包
AVAILABLE_PACKAGES=("core" "widget" "babel-plugin" "babel-preset-widget")

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 帮助信息
show_help() {
    echo -e "${BLUE}Usage: $0 <package1> [package2] [...] [mode]${NC}"
    echo ""
    echo "Parameters:"
    echo "  package    One or more package names to build (${AVAILABLE_PACKAGES[*]})"
    echo "  mode       Build mode: 'build' (default) or 'watch' (must be last argument)"
    echo ""
    echo "Examples:"
    echo "  $0 core                        # Build single package"
    echo "  $0 core widget                 # Build multiple packages"
    echo "  $0 core widget babel-plugin    # Build multiple packages"
    echo "  $0 widget watch                # Watch single package"
    echo "  $0 core widget watch           # Watch multiple packages (parallel)"
    echo ""
    exit 1
}

# 检查参数
if [ $# -eq 0 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
fi

# 解析参数：最后一个参数如果是 watch 则为模式，否则默认为 build
ARGS=("$@")
LAST_ARG="${!#}"
if [ "$LAST_ARG" = "watch" ]; then
    MODE="watch"
    PACKAGES=("${ARGS[@]:0:$#-1}")  # 除了最后一个参数
else
    MODE="build"
    PACKAGES=("${ARGS[@]}")  # 所有参数
fi

# 检查是否有包参数
if [ ${#PACKAGES[@]} -eq 0 ]; then
    echo -e "${RED}❌ No packages specified${NC}"
    show_help
fi

# 验证包名
is_valid_package() {
    local package="$1"
    for valid_package in "${AVAILABLE_PACKAGES[@]}"; do
        if [ "$package" = "$valid_package" ]; then
            return 0
        fi
    done
    return 1
}

# 验证所有包名
INVALID_PACKAGES=()
for package in "${PACKAGES[@]}"; do
    if ! is_valid_package "$package"; then
        INVALID_PACKAGES+=("$package")
    fi
done

if [ ${#INVALID_PACKAGES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Unknown package(s): ${INVALID_PACKAGES[*]}${NC}"
    echo -e "${YELLOW}Available packages: ${AVAILABLE_PACKAGES[*]}${NC}"
    exit 1
fi

# 验证模式
if [ "$MODE" != "build" ] && [ "$MODE" != "watch" ]; then
    echo -e "${RED}❌ Unknown mode: $MODE${NC}"
    echo -e "${YELLOW}Available modes: build, watch${NC}"
    exit 1
fi

# 构建函数
build_package() {
    local package_name="$1"
    local package_path="packages/$package_name"
    
    # 检查包目录是否存在
    if [ ! -d "$package_path" ]; then
        echo -e "${RED}❌ Package directory not found: $package_path${NC}"
        return 1
    fi

    # 检查 package.json 是否存在
    local package_json_path="$package_path/package.json"
    if [ ! -f "$package_json_path" ]; then
        echo -e "${RED}❌ package.json not found: $package_json_path${NC}"
        return 1
    fi

    # 读取包信息
    local package_info=$(node -e "
    const pkg = require('./$package_json_path');
    console.log(\`\${pkg.name}@\${pkg.version}\`);
    ")

    # 构建 tsdown 参数
    local tsdown_args="--config ../../tsdown.config.ts"
    if [ "$MODE" = "watch" ]; then
        tsdown_args="$tsdown_args --watch"
    fi

    # 输出信息
    if [ "$MODE" = "watch" ]; then
        echo -e "${BLUE}🚀 Watching package: $package_name${NC}"
    else
        echo -e "${BLUE}🚀 Building package: $package_name${NC}"
    fi
    echo -e "${YELLOW}📦 Package: $package_info${NC}"
    echo -e "${YELLOW}📁 Working directory: $package_path${NC}"
    echo ""

    # 进入包目录并执行构建
    (
        cd "$package_path" || exit 1
        
        # 设置环境变量并运行 tsdown
        export PACKAGE_NAME="$package_name"
        
        if npx tsdown $tsdown_args; then
            if [ "$MODE" = "watch" ]; then
                echo -e "${GREEN}✅ Successfully started watching $package_name${NC}"
            else
                echo -e "${GREEN}✅ Successfully built $package_name${NC}"
            fi
            return 0
        else
            echo -e "${RED}❌ Failed to $MODE $package_name${NC}"
            return 1
        fi
    )
}

# 如果是 watch 模式且有多个包，并行启动监听
if [ "$MODE" = "watch" ] && [ ${#PACKAGES[@]} -gt 1 ]; then
    echo -e "${BLUE}🔄 Starting parallel watch mode for packages: ${PACKAGES[*]}${NC}"
    echo -e "${YELLOW}💡 Press Ctrl+C to stop all watchers${NC}"
    echo ""
    
    # 存储后台进程 PID
    WATCH_PIDS=()
    
    # 为每个包启动独立的 watch 进程
    for package in "${PACKAGES[@]}"; do
        echo -e "${BLUE}🚀 Starting watcher for: $package${NC}"
        
        # 在后台启动 watch 进程
        (
            cd "packages/$package" || exit 1
            export PACKAGE_NAME="$package"
            npx tsdown --config ../../tsdown.config.ts --watch
        ) &
        
        # 记录 PID
        WATCH_PIDS+=($!)
        sleep 1  # 稍微延迟避免输出混乱
    done
    
    echo ""
    echo -e "${GREEN}✅ All watchers started (PIDs: ${WATCH_PIDS[*]})${NC}"
    echo -e "${YELLOW}📝 Logs from all packages will be mixed. Use separate terminals for cleaner output.${NC}"
    echo ""
    
    # 设置信号处理器，确保所有子进程在退出时被杀死
    cleanup() {
        echo ""
        echo -e "${YELLOW}🛑 Stopping all watchers...${NC}"
        for pid in "${WATCH_PIDS[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null
            fi
        done
        wait
        echo -e "${GREEN}✅ All watchers stopped${NC}"
        exit 0
    }
    
    # 捕获 SIGINT (Ctrl+C) 和 SIGTERM
    trap cleanup SIGINT SIGTERM
    
    # 等待所有后台进程
    wait
    
elif [ "$MODE" = "watch" ]; then
    # 单包 watch 模式
    build_package "${PACKAGES[0]}"
else
    # 构建所有包
    FAILED_PACKAGES=()
    for package in "${PACKAGES[@]}"; do
        if ! build_package "$package"; then
            FAILED_PACKAGES+=("$package")
        fi
        echo ""  # 空行分隔
    done
    
    # 总结
    if [ ${#FAILED_PACKAGES[@]} -gt 0 ]; then
        echo -e "${RED}❌ Failed to build: ${FAILED_PACKAGES[*]}${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Successfully built all packages: ${PACKAGES[*]}${NC}"
    fi
fi 