import BaseTokenManager from "@/components/BaseTokenManager";
import Registry from "@/components/Registry";

export default function Home() {
  return (
    <div className="space-y-8">
      <BaseTokenManager />
      <Registry />
    </div>
  );
}
