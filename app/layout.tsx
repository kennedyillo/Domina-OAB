import type { Metadata } from "next";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "./globals.css";
const title = "Domina OAB | Diagnóstico inteligente para a 1ª fase";
const description = "Descubra o que falta para chegar aos 40 pontos com diagnóstico por tema, questões comentadas e um plano de estudos orientado pelo seu desempenho.";
const socialImage = "https://domina-oab.kmps16.chatgpt.site/og.png";

export const metadata: Metadata = {
  title,
  description,
  keywords:["simulado OAB","OAB 1ª fase","questões OAB","diagnóstico OAB","questões comentadas OAB","plano de estudos OAB","Ética OAB"],
  icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"},
  openGraph:{title,description,type:"website",locale:"pt_BR",images:[{url:socialImage,width:1200,height:630,alt:"Domina OAB — diagnóstico inteligente para chegar aos 40 pontos"}]},
  twitter:{card:"summary_large_image",title,description,images:[socialImage]},
  other:{"codex-preview":"development"},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}<AnalyticsTracker/></body></html>}
