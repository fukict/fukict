#!/bin/bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_title() {
    echo ""
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo ""
}

# 执行命令的函数
run_command() {
    local command="$1"
    local description="$2"
    
    log_info "${description}..."
    
    if eval "$command"; then
        log_success "${description} 完成"
        return 0
    else
        log_error "${description} 失败"
        return 1
    fi
}

# 检查 Git 状态
check_git_status() {
    local status=$(git status --porcelain 2>/dev/null)
    
    if [[ -n "$status" ]]; then
        log_warning "检测到未提交的更改:"
        echo "$status"
        return 1
    fi
    return 0
}

# 确认提示
confirm() {
    local message="$1"
    local default="${2:-n}"
    
    while true; do
        if [[ "$default" == "y" ]]; then
            read -p "$message [Y/n]: " yn
            yn=${yn:-y}
        else
            read -p "$message [y/N]: " yn
            yn=${yn:-n}
        fi
        
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "请输入 y 或 n.";;
        esac
    done
}

# 显示菜单
show_menu() {
    log_title "🚀 Vanilla DOM 发布工具"
    
    echo "请选择发布类型:"
    echo ""
    echo "1) 🎯 正式发布 (Production Release)"
    echo "2) 🧪 Alpha 版本 (开发测试版)"
    echo "3) 🔬 Beta 版本 (公开测试版)"
    echo "4) 🎪 RC 版本 (发布候选版)"
    echo "5) 📋 仅创建 Changeset"
    echo "6) 📊 查看发布状态"
    echo "7) 🔑 检查 npm 发布权限"
    echo "0) 退出"
    echo ""
}

# 处理正式发布
handle_production_release() {
    log_title "🎯 正式发布流程"
    
    echo "正式发布流程将执行以下步骤："
    echo "  1. 检查是否有 changeset 文件"
    echo "  2. 代码格式化和 lint 检查"
    echo "  3. 运行测试"
    echo "  4. 构建所有包"
    echo "  5. 更新版本号并生成 changelog"
    echo "  6. 提交版本更改到 git"
    echo "  7. 发布到 npm"
    echo "  8. 创建并推送 git 标签"
    echo ""
    
    if ! confirm "确认开始正式发布?" "n"; then
        log_info "发布已取消"
        return
    fi
    
    # 检查 npm 发布权限
    if ! check_npm_access; then
        log_error "npm 发布权限检查失败"
        return
    fi
    
    # 检查是否有 changeset 文件
    if ! ls .changeset/*.md >/dev/null 2>&1; then
        log_warning "没有找到 changeset 文件"
        if confirm "是否先创建 changeset?" "y"; then
            if ! run_command "pnpm changeset" "创建 changeset"; then
                log_error "创建 changeset 失败"
                return
            fi
        else
            log_error "正式发布需要先创建 changeset"
            return
        fi
    fi
    
    # 执行发布流程
    if run_command "pnpm format" "代码格式化" && \
       run_command "pnpm lint" "代码 lint 检查" && \
       run_command "pnpm test" "运行测试" && \
       run_command "pnpm build" "构建所有包" && \
       run_command "pnpm changeset:version" "更新版本号并生成 changelog" && \
       run_command "git add ." "添加所有更改到 git" && \
       run_command "git commit -m 'chore: release version'" "提交版本更改" && \
       run_command "pnpm changeset:publish" "发布到 npm" && \
       create_and_push_tags; then
        log_success "🎉 正式版本发布成功！"
    else
        log_error "发布流程中断"
    fi
}

# 处理预发布版本
handle_pre_release() {
    local type="$1"
    local name desc emoji
    
    case "$type" in
        "alpha")
            name="Alpha"
            desc="开发测试版"
            emoji="🧪"
            ;;
        "beta")
            name="Beta"
            desc="公开测试版"
            emoji="🔬"
            ;;
        "rc")
            name="RC"
            desc="发布候选版"
            emoji="🎪"
            ;;
    esac
    
    log_title "$emoji $name 版本发布流程"
    
    echo "$name 版本发布流程："
    echo "  1. 代码格式化和 lint 检查"
    echo "  2. 运行测试" 
    echo "  3. 构建所有包"
    echo "  4. 基于当前更改生成 $type 快照版本"
    echo "  5. 直接发布到 npm (带 $type 标签)"
    echo ""
    log_warning "注意: 预发布版本会基于当前工作区的更改直接生成，无需预先创建 changeset"
    echo ""
    
    if ! confirm "确认要发布 $name 版本 ($desc) 吗?" "y"; then
        log_info "发布已取消"
        return
    fi
    
    # 检查 npm 发布权限
    if ! check_npm_access; then
        log_error "npm 发布权限检查失败"
        return
    fi
    
    # 执行预发布流程
    if run_command "pnpm format" "代码格式化" && \
       run_command "pnpm lint" "代码 lint 检查" && \
       run_command "pnpm test" "运行测试" && \
       run_command "pnpm build" "构建所有包" && \
       run_command "pnpm version:$type" "发布 $name 版本"; then
        log_success "🎉 $name 版本发布成功！"
        log_info "可以通过 npm install @vanilla-dom/core@$type 来安装"
    else
        log_error "发布流程中断"
    fi
}

# 创建 changeset
handle_create_changeset() {
    log_title "📋 创建 Changeset"
    
    echo "Changeset 创建流程："
    echo "  1. 检测工作区中已更改的包"
    echo "  2. 选择需要发布的包和版本类型"
    echo "  3. 添加变更描述"
    echo "  4. 生成 .changeset/*.md 文件"
    echo ""
    log_info "Changeset 会基于当前工作区的文件更改来检测哪些包需要发布"
    echo ""
    
    if run_command "pnpm changeset" "创建 changeset"; then
        log_success "Changeset 创建完成！"
        log_info "生成的 changeset 文件已保存到 .changeset/ 目录"
        log_info "可以继续选择其他操作，或提交这些文件到 git"
    fi
}

# 创建并推送 git 标签
create_and_push_tags() {
    log_info "创建 git 标签..."
    
    # 获取所有包的版本信息并创建标签
    for package_dir in packages/*/; do
        if [[ -f "$package_dir/package.json" ]]; then
            local package_name=$(node -p "require('./$package_dir/package.json').name" 2>/dev/null)
            local package_version=$(node -p "require('./$package_dir/package.json').version" 2>/dev/null)
            
            if [[ -n "$package_name" && -n "$package_version" ]]; then
                local tag_name="${package_name}@${package_version}"
                
                # 检查标签是否已存在
                if git tag -l "$tag_name" | grep -q "$tag_name"; then
                    log_warning "标签 $tag_name 已存在，跳过"
                else
                    if git tag "$tag_name"; then
                        log_success "创建标签: $tag_name"
                    else
                        log_error "创建标签失败: $tag_name"
                        return 1
                    fi
                fi
            fi
        fi
    done
    
    # 推送所有标签
    if confirm "是否推送标签到远程仓库?" "y"; then
        if run_command "git push --tags" "推送标签到远程仓库"; then
            log_success "所有标签已推送到远程仓库"
        else
            log_error "推送标签失败"
            return 1
        fi
    else
        log_info "标签已创建但未推送到远程仓库"
        log_info "可以稍后使用 'git push --tags' 手动推送"
    fi
    
    return 0
}

# 检查 npm 发布权限
check_npm_access() {
    log_info "检查 npm 发布权限..."
    
    # 检查是否登录 npm
    if ! npm whoami >/dev/null 2>&1; then
        log_error "未登录 npm，请先运行: npm login"
        return 1
    fi
    
    local npm_user=$(npm whoami)
    log_success "当前 npm 用户: $npm_user"
    
    # 检查 @vanilla-dom 组织是否存在
    log_info "检查 @vanilla-dom 组织权限..."
    if npm access list packages @vanilla-dom >/dev/null 2>&1; then
        log_success "@vanilla-dom 组织存在且有访问权限"
    else
        log_error "@vanilla-dom 组织不存在或无访问权限"
        echo ""
        echo "解决方案："
        echo "1. 在 npm 上创建 @vanilla-dom 组织:"
        echo "   https://www.npmjs.com/org/create"
        echo ""
        echo "2. 或者修改包名，不使用 scoped package:"
        echo "   例如: vanilla-dom-core 而不是 @vanilla-dom/core"
        echo ""
        echo "3. 或者联系 @vanilla-dom 组织管理员添加发布权限"
        return 1
    fi
    
    return 0
}

# 查看状态
handle_status() {
    log_title "📊 发布状态"
    run_command "pnpm changeset status" "检查发布状态"
}

# 显示帮助信息
show_help() {
    echo "Vanilla DOM 发布工具"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -v, --version  显示版本信息"
    echo ""
    echo "无参数运行时启动交互式发布菜单"
}

# 显示版本信息
show_version() {
    echo "Vanilla DOM 发布工具 v1.0.0"
}

# 主函数
main() {
    # 处理命令行参数
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            show_version
            exit 0
            ;;
        "")
            # 无参数，继续正常流程
            ;;
        *)
            log_error "未知参数: $1"
            echo "使用 $0 --help 查看帮助"
            exit 1
            ;;
    esac
    
    # 检查是否在正确的目录
    if [[ ! -f "package.json" ]] || [[ ! -d ".changeset" ]]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    while true; do
        show_menu
        read -p "请选择 (0-7): " choice
        
        case $choice in
            1)
                handle_production_release
                ;;
            2)
                handle_pre_release "alpha"
                ;;
            3)
                handle_pre_release "beta"
                ;;
            4)
                handle_pre_release "rc"
                ;;
            5)
                handle_create_changeset
                ;;
            6)
                handle_status
                ;;
            7)
                log_title "🔑 npm 发布权限检查"
                check_npm_access
                ;;
            0)
                log_info "退出发布工具"
                exit 0
                ;;
            *)
                log_error "无效选择，请输入 0-7 之间的数字"
                ;;
        esac
        
        echo ""
        read -p "按 Enter 键继续..."
        clear
    done
}

# 错误处理
trap 'log_info "\n发布流程已中断"; exit 0' INT

# 启动主函数
main "$@" 