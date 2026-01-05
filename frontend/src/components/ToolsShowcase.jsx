// components/ToolsShowcase.jsx
export default function ToolsShowcase() {
  // Tool images data
  const tools = [
    {
      name: "Photoshop",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764144946/photoshop_kv1f1t.png"
    },
    {
      name: "Illustrator",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145547/illustrator_cjs8sc.png"
    },
    {
      name: "3DS Max",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764144965/3ds-max-_i2fgfn.png"
    },
    {
      name: "AutoCAD",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764144975/autocad_gqrepv.png"
    },
    {
      name: "FL Studio",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145145/Flstudio_ewfhfk.png"
    },
    {
      name: "ZBrush",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764144984/zbrush_bhdbyj.png"
    },
    {
      name: "Unity",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145134/Unity_lhjahc.png"
    },
    {
      name: "Premiere Pro",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764144935/premier_pro_gtp72l.png"
    },
    {
      name: "RealFlow",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145374/realflow_etkfgz.png"
    },
    {
      name: "Unreal Engine",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145155/Unreal_Engine_zaeupg.png"
    },
    {
      name: "D5 Render",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145221/d5-render_d7mwvb.png"
    },
    {
      name: "After Effects",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145178/AE_xxselg.png"
    },
    {
      name: "Maya",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145210/maya_hww3pe.png"
    },
    {
      name: "Substance Painter",
      url: "https://res.cloudinary.com/demcdzfpj/image/upload/v1764145164/substance_painter_hmoze3.png"
    }
  ];

  // Tool card component
  const ToolCard = ({ tool }) => (
    <div className="flex-shrink-0 w-24 h-24 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 flex items-center justify-center hover:-translate-y-2">
      <img
        src={tool.url}
        alt={tool.name}
        className="w-full h-full object-contain"
      />
    </div>
  );

  return (
    <div className="py-16 bg-white overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Tools & Technologies
        </h2>
        <p className="text-lg text-gray-600">
          Software and platforms used by our creative community
        </p>
      </div>

      {/* Left to Right Scroll */}
      <div className="relative mb-8">
        <div className="flex animate-scroll-left">
          {/* First Set */}
          <div className="flex gap-6 px-3">
            {tools.map((tool, index) => (
              <ToolCard key={`left-1-${index}`} tool={tool} />
            ))}
          </div>

          {/* Duplicate Set for Seamless Loop */}
          <div className="flex gap-6 px-3">
            {tools.map((tool, index) => (
              <ToolCard key={`left-2-${index}`} tool={tool} />
            ))}
          </div>
        </div>
      </div>

      {/* Right to Left Scroll */}
      <div className="relative">
        <div className="flex animate-scroll-right">
          {/* First Set */}
          <div className="flex gap-6 px-3">
            {tools.map((tool, index) => (
              <ToolCard key={`right-1-${index}`} tool={tool} />
            ))}
          </div>

          {/* Duplicate Set for Seamless Loop */}
          <div className="flex gap-6 px-3">
            {tools.map((tool, index) => (
              <ToolCard key={`right-2-${index}`} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}