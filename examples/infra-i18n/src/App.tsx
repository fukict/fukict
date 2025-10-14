/**
 * @fukict/i18n Example - App Component
 */
import { Fukict } from '@fukict/basic';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { i18n } from './i18n';
import { HomePage } from './pages/HomePage';

export class App extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // Subscribe to locale changes at root component
    this.unsubscribe = i18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main class="container mx-auto px-4 py-8">
          <HomePage />
        </main>
        <Footer />
      </div>
    );
  }
}
