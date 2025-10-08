import { RouteWidget, RouterView } from '@fukict/router';

export class RuntimeExamples extends RouteWidget {
  render() {
    return <RouterView router={this.router} />;
  }
}

export default RuntimeExamples;
