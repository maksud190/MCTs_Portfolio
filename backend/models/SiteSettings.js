import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    heroTitle: { 
      type: String, 
      default: "Discover Amazing Projects" 
    },
    heroSubtitle: { 
      type: String, 
      default: "Explore a diverse collection of projects" 
    },
    aboutUsContent: { 
      type: String,
      default: "" 
    },
    contactEmail: { 
      type: String,
      default: "support@mctportfolio.com" 
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" }
    },
    maintenanceMode: { 
      type: Boolean, 
      default: false 
    },
    maintenanceMessage: { 
      type: String,
      default: "Site under maintenance" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);