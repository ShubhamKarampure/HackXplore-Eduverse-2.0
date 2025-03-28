// Full Page Loader Component
 import {  Loader2 } from "lucide-react";
  const Loader = () => (
      <div className="flex flex-col items-center">
        <Loader2 
          className="animate-spin text-blue-600 mb-4" 
          size={100} 
        />
      </div>

);
  
export default Loader;