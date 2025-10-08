import { RouteWidget, RouterView } from '@fukict/router';

export class WidgetFunctionExamples extends RouteWidget {
  render() {
    return <RouterView router={this.router} />;
  }
}

export default WidgetFunctionExamples;
