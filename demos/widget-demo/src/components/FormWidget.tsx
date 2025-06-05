import { Widget } from '@vanilla-dom/widget';

interface FormWidgetProps {
  title?: string;
}

export class FormWidget extends Widget<FormWidgetProps> {
  render() {
    return (
      <div className="form-example">
        <h3>{this.props.title || '📋 用户信息表单'}</h3>
        <form className="user-form" on:submit={this.handleFormSubmit.bind(this)}>
          <div className="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              name="username"
              className="form-control"
              placeholder="请输入用户名"
              required 
            />
          </div>
          <div className="form-group">
            <label>邮箱</label>
            <input 
              type="email" 
              name="email"
              className="form-control"
              placeholder="请输入邮箱"
              required 
            />
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              on:click={this.handleFormReset.bind(this)}
            >
              重置
            </button>
            <button type="submit" className="btn btn-primary">
              提交
            </button>
          </div>
        </form>
      </div>
    );
  }

  private handleFormSubmit(e: Event) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    console.log('表单提交:', data);
    alert('表单提交成功！请查看控制台输出。');
    
    // 使用 Widget 的 DOM 查询 API 进行精确操作
    const submitBtn = this.$('.btn-primary');
    if (submitBtn) {
      const originalText = submitBtn.get('textContent');
      submitBtn.set('textContent', '提交成功!');
      submitBtn.set('disabled', true);
      
      // 2秒后恢复按钮状态
      setTimeout(() => {
        submitBtn.set('textContent', originalText);
        submitBtn.set('disabled', false);
      }, 2000);
    }
  }

  private handleFormReset() {
    // 使用 DOM 查询 API 获取表单
    const form = this.$('.user-form');
    if (form && form.element instanceof HTMLFormElement) {
      form.element.reset();
      console.log('表单已重置');
      
      // 批量重置所有输入框的样式
      const inputs = this.$$('input.form-control');
      inputs.batchSet('className', 'form-control');
    }
  }
} 