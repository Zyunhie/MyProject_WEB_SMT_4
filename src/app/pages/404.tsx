import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Image
        src="/404-image.svg"
        alt="404 Illustration"
        width={300}
        height={300}
      />
      <h1 className="mt-6 text-6xl font-bold text-gray-800">404</h1>
      <p className="mt-2 text-lg text-gray-600">
        Oops! The page you are looking for cannot be found.
      </p>
      <div className="mt-4">
        <Link href="/">
          <a className="px-6 py-2 text-lg font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            Back to Homepage
          </a>
        </Link>
      </div>
    </div>
  );
}
