#!/bin/bash

# 可用的包
AVAILABLE_PACKAGES=("core" "widget" "babel-plugin" "babel-preset-widget")

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 帮助信息
show_help() {
    echo -e "${BLUE}Usage: $0 [options]${NC}"
    echo ""
    echo "Options:"
    echo "  --all                  Build all packages"
    echo "  --pkg-name <packages>  Specify package names (${AVAILABLE_PACKAGES[*]})"
    echo "  --watch               Use watch mode"
    echo "  --no-watch            Disable watch mode (skip interactive)"
    echo "  --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Interactive mode"
    echo "  $0 --all                              # Build all packages (may ask about watch)"
    echo "  $0 --all --no-watch                   # Build all packages (no interaction)"
    echo "  $0 --pkg-name core                    # Build single package (may ask about watch)"
    echo "  $0 --pkg-name core --no-watch         # Build single package (no interaction)"
    echo "  $0 --all --watch                      # Watch all packages"
    echo "  $0 --pkg-name core widget --watch     # Watch multiple packages"
    echo ""
    exit 1
}



# 确认构建
confirm_build() {
    echo -e "${CYAN}📋 构建确认:${NC}"
    echo -e "${YELLOW}包: ${PACKAGES[*]}${NC}"
    echo -e "${YELLOW}模式: $MODE${NC}"
    echo ""
    
    echo -e "${BLUE}确认开始构建? (y/N): ${NC}"
    read -r confirm
    
    case "$confirm" in
        [yY]|[yY][eE][sS])
            echo -e "${GREEN}✅ 开始构建...${NC}"
            echo ""
            return 0
            ;;
        *)
            echo -e "${YELLOW}❌ 构建已取消${NC}"
            return 1
            ;;
    esac
}

# 交互选择包（当没有指定 --all 或 --pkg-name 时）
interactive_select_packages() {
    echo -e "${CYAN}📦 选择要构建的包:${NC}"
    echo ""
    
    local selected_packages=()
    
    # 显示包选项（默认全选）
    for i in "${!AVAILABLE_PACKAGES[@]}"; do
        echo -e "${YELLOW}[$((i+1))] ${AVAILABLE_PACKAGES[i]} ${GREEN}[✓]${NC}"
    done
    echo -e "${YELLOW}[0] 取消全选${NC}"
    echo ""
    
    # 读取用户输入
    echo -e "${BLUE}输入包编号 (用空格分隔，直接回车=全选): ${NC}"
    read -r user_input
    
    # 如果用户直接回车，选择所有包
    if [ -z "$user_input" ]; then
        selected_packages=("${AVAILABLE_PACKAGES[@]}")
        echo -e "${GREEN}✅ 已选择所有包: ${selected_packages[*]}${NC}"
    else
        # 解析用户输入
        for num in $user_input; do
            if [[ "$num" =~ ^[0-9]+$ ]]; then
                if [ "$num" -eq 0 ]; then
                    # 取消全选
                    selected_packages=()
                    break
                elif [ "$num" -ge 1 ] && [ "$num" -le ${#AVAILABLE_PACKAGES[@]} ]; then
                    local package_name="${AVAILABLE_PACKAGES[$((num-1))]}"
                    # 检查是否已选择
                    if [[ ! " ${selected_packages[*]} " =~ " ${package_name} " ]]; then
                        selected_packages+=("$package_name")
                    fi
                fi
            fi
        done
        
        if [ ${#selected_packages[@]} -eq 0 ]; then
            echo -e "${YELLOW}⚠️  未选择任何包${NC}"
            return 1
        else
            echo -e "${GREEN}✅ 已选择包: ${selected_packages[*]}${NC}"
        fi
    fi
    
    echo ""
    PACKAGES=("${selected_packages[@]}")
    return 0
}

# 交互选择是否监听（当没有指定 --watch 时）
interactive_select_watch() {
    echo -e "${CYAN}🔧 是否需要监听模式:${NC}"
    echo -e "${YELLOW}[y] 是 - 监听文件变化${NC}"
    echo -e "${YELLOW}[n] 否 - 单次构建 ${GREEN}[默认]${NC}"
    echo ""
    
    echo -e "${BLUE}是否启用监听模式? (y/N): ${NC}"
    read -r watch_choice
    
    case "$watch_choice" in
        [yY]|[yY][eE][sS])
            USE_WATCH=true
            echo -e "${GREEN}✅ 启用监听模式${NC}"
            ;;
        *)
            USE_WATCH=false
            echo -e "${GREEN}✅ 使用单次构建${NC}"
            ;;
    esac
    echo ""
}

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

# 解析命令行选项
parse_arguments() {
    local use_all=false
    local use_watch=""
    local pkg_names=()
    
    # 解析选项
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                use_all=true
                shift
                ;;
            --watch)
                use_watch="true"
                shift
                ;;
            --no-watch)
                use_watch="false"
                shift
                ;;
            --pkg-name)
                shift
                # 收集包名直到遇到下一个选项或结束
                while [[ $# -gt 0 && ! "$1" =~ ^-- ]]; do
                    pkg_names+=("$1")
                    shift
                done
                ;;
            --help|-h)
                show_help
                ;;
            -*)
                echo -e "${RED}❌ 未知选项: $1${NC}"
                show_help
                ;;
            *)
                echo -e "${RED}❌ 位置参数无效: $1${NC}"
                echo -e "${YELLOW}请使用 --pkg-name 指定包名${NC}"
                show_help
                ;;
        esac
    done
    
    # 设置包列表
    if [ "$use_all" = true ]; then
        PACKAGES=("${AVAILABLE_PACKAGES[@]}")
        echo -e "${GREEN}🚀 使用 --all 参数，构建所有包${NC}"
        if [ ${#pkg_names[@]} -gt 0 ]; then
            echo -e "${YELLOW}⚠️  --all 参数存在，--pkg-name 参数被忽略${NC}"
        fi
    elif [ ${#pkg_names[@]} -gt 0 ]; then
        # 验证指定的包名
        local invalid_packages=()
        for package in "${pkg_names[@]}"; do
            if ! is_valid_package "$package"; then
                invalid_packages+=("$package")
            fi
        done
        
        if [ ${#invalid_packages[@]} -gt 0 ]; then
            echo -e "${RED}❌ 未知包: ${invalid_packages[*]}${NC}"
            echo -e "${YELLOW}可用包: ${AVAILABLE_PACKAGES[*]}${NC}"
            exit 1
        fi
        
        PACKAGES=("${pkg_names[@]}")
        echo -e "${GREEN}🚀 指定包: ${PACKAGES[*]}${NC}"
    else
        # 没有指定包，进入交互选择
        echo -e "${BLUE}🚀 Vanilla DOM 包构建工具 - 交互模式${NC}"
        echo ""
        
        if ! interactive_select_packages; then
            echo -e "${RED}❌ 包选择已取消${NC}"
            exit 1
        fi
    fi
    
    # 设置监听模式
    if [ "$use_watch" = "true" ]; then
        USE_WATCH=true
        echo -e "${BLUE}📺 监听模式: ${PACKAGES[*]}${NC}"
    elif [ "$use_watch" = "false" ]; then
        USE_WATCH=false
        echo -e "${BLUE}🔨 构建模式: ${PACKAGES[*]}${NC}"
    else
        # 没有指定 --watch 或 --no-watch，且是交互模式时，询问是否需要监听
        if [ ${#pkg_names[@]} -eq 0 ] && [ "$use_all" = false ]; then
            interactive_select_watch
        else
            # 命令行模式但没有指定 watch 选项，默认 build
            USE_WATCH=false
            echo -e "${BLUE}🔨 构建模式: ${PACKAGES[*]}${NC}"
        fi
    fi
    echo ""
    
    return 0
}

# 解析参数并执行
parse_arguments "$@"

# 确认构建（仅在交互模式下）
if [ ${#PACKAGES[@]} -gt 0 ]; then
    if [[ "$*" == *"--"* ]]; then
        # 命令行模式，直接执行
        echo -e "${GREEN}✅ 开始构建...${NC}"
        echo ""
    else
        # 交互模式，需要确认
        if ! confirm_build; then
            exit 1
        fi
    fi
fi

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
    if [ "$USE_WATCH" = true ]; then
        tsdown_args="$tsdown_args --watch"
    fi

    # 输出信息
    if [ "$USE_WATCH" = true ]; then
        echo -e "${BLUE}🚀 Watching package: $package_name${NC}"
        echo -e "${CYAN}👀 Press Ctrl+C to stop watching${NC}"
    else
        echo -e "${BLUE}🚀 Building package: $package_name${NC}"
    fi
    echo -e "${YELLOW}📦 Package: $package_info${NC}"
    echo -e "${YELLOW}📁 Working directory: $package_path${NC}"
    echo -e "${YELLOW}🔧 Mode: $([ "$USE_WATCH" = true ] && echo "watch" || echo "build")${NC}"
    echo ""

    # 进入包目录并执行构建
    (
        cd "$package_path" || exit 1
        
        # 设置环境变量并运行 tsdown
        export PACKAGE_NAME="$package_name"
        if [ "$USE_WATCH" = true ]; then
            export NODE_ENV="development"
        else
            export NODE_ENV="production"
        fi
        
        if npx tsdown $tsdown_args; then
            if [ "$USE_WATCH" = true ]; then
                echo -e "${GREEN}✅ Successfully started watching $package_name${NC}"
            else
                echo -e "${GREEN}✅ Successfully built $package_name${NC}"
            fi
            return 0
        else
            local mode_name=$([ "$USE_WATCH" = true ] && echo "watch" || echo "build")
            echo -e "${RED}❌ Failed to $mode_name $package_name${NC}"
            return 1
        fi
    )
}

# 如果是 watch 模式且有多个包，并行启动监听
if [ "$USE_WATCH" = true ] && [ ${#PACKAGES[@]} -gt 1 ]; then
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
            export NODE_ENV="development"
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
    
elif [ "$USE_WATCH" = true ]; then
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