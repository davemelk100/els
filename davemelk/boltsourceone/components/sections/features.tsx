import { Code, Layout, Shield } from 'lucide-react';

export function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Layout className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Modern Structure</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Organized project structure following best practices
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Code className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">TypeScript Ready</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Built with TypeScript for better development experience
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Best Practices</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Follows modern development standards and security practices
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}