import {
  LayoutGrid,
  FileText,
  FileUp,
} from "lucide-react";

export const navigationData = {
  Dashboard: [
    {
      name: "Overview",
      icon: LayoutGrid,
      href: "/dashboard",
    },
  ],
  Orion: [
    {
      name: "Advisory",
      icon: FileText,
      href: "/orion/advisory",
    },
    {
      name: "PDF Generator",
      icon: FileUp,
      href: "/agents/pdf-generator",
    },
  ],
};

export type NavigationData = typeof navigationData;
