import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[50vh]">
      <Loader size="lg" />;
    </div>
  );
}
