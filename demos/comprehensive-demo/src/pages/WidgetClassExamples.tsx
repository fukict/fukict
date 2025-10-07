import { RouteWidget, RouterView } from '@fukict/router';

export class WidgetClassExamples extends RouteWidget {
  render() {
    return <RouterView router={this.router} />;
  }
}

export default WidgetClassExamples;
