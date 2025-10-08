import { RouteWidget, RouterView } from '@fukict/router';

export class RouterExamples extends RouteWidget {
  render() {
    return <RouterView router={this.router} />;
  }
}

export default RouterExamples;
