import {
  Activity,
} from "lucide-react";
import type { NavigationItem } from "./navigation";

// Global items shown always
export const globalNavigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Activity,
    isActive: true,
  },
];

export const marketingMapNavigationItems: NavigationItem[] = [
  {
    title: "Regions",
    url: "/admin/region/province",
    icon: Activity,
    items: [
      {
        title: "Province",
        url: "/admin/region/province",
      },
      {
        title: "Regency",
        url: "/admin/region/regency",
      },
    ],
  },
  {
    title: "Lands",
    url: "/admin/land",
    icon: Activity,
    items: [
      {
        title: "Land Type",
        url: "/admin/land",
      },
      {
        title: "Province Land",
        url: "/admin/land/province",
      },
      {
        title: "Regency Land",
        url: "/admin/land/regency",
      },
    ],
  },
  {
    title: "Commodities",
    url: "/admin/commodity",
    icon: Activity,
    items: [
      {
        title: "Commodity Type",
        url: "/admin/commodity",
      },
      {
        title: "Province Commodity",
        url: "/admin/commodity/province",
      },
      {
        title: "Regency Commodity",
        url: "/admin/commodity/regency",
      },
    ],
  },
  {
    title: "Products",
    url: "/admin/product",
    icon: Activity,
    items: [
      {
        title: "Product Type",
        url: "/admin/product",
      },
      {
        title: "Product Brand",
        url: "/admin/product/brand",
      },
      {
        title: "Product Dosage",
        url: "/admin/product/dosage",
      },
    ],
  },
];

export const saleNavigationItems: NavigationItem[] = [
  {
    title: "Sales Overview",
    url: "/admin/sale",
    icon: Activity,
    items: [
      {
        title: "Sales Realization",
        url: "/admin/sale",
      },
      {
        title: "Daily Sales",
        url: "/admin/sale/daily",
      }
    ]
  },
];

export const stallNavigationItems: NavigationItem[] = [
  {
    title: "Stalls Overview",
    url: "/admin/stall",
    icon: Activity,
  },
];
