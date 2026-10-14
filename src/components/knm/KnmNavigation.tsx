"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links=[{href:"/knm",label:"المنهج"},{href:"/knm/exams",label:"امتحانات تدريبية"},{href:"/knm/progress",label:"تقدّمي في KNM"},{href:"/knm/review",label:"مراجعة الأخطاء"},{href:"/knm/sources",label:"المصادر والنسخة"}];
export function KnmNavigation(){const path=usePathname();return <nav className="knm-navigation" aria-label="مسار KNM">{links.map((link)=><Link key={link.href} href={link.href} aria-current={path===link.href?"page":link.href==="/knm/exams"&&path.startsWith("/knm/exams/")||link.href==="/knm"&&path.startsWith("/knm/lessons/")?"location":undefined}>{link.label}</Link>)}</nav>;}
