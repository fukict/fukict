import { defineWidget } from '@fukict/widget';
import type { Router } from '@fukict/router';
import { RouterView } from '@fukict/router';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  router: Router;
}

export const MainLayout = defineWidget<MainLayoutProps>(({ router }) => {
  return (
    <div class="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar router={router} />

      {/* Main Content */}
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-5xl mx-auto p-8">
          <RouterView router={router} />
        </div>
      </main>
    </div>
  );
});
