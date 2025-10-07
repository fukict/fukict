import { RouteWidget, RouterView } from '@fukict/router';

export class StateExamples extends RouteWidget {
  render() {
    return <RouterView router={this.router} />;
  }
}

export default StateExamples;
