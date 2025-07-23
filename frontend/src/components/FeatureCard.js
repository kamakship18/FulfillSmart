// Feature Card Component
import Link from "next/link";

export default function FeatureCard({ title, description, icon, link }) {
  const CardContent = () => (
    <div className="rounded-2xl p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="p-3 bg-indigo-100 rounded-xl">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 ml-4">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed">{description}</p>
      {link && (
        <div className="mt-4">
          <span className="text-indigo-600 font-medium hover:text-indigo-700">
            Explore →
          </span>
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block hover:scale-105 transition-transform duration-200">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
