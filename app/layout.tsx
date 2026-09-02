import type { Metadata } from "next";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "./globals.css";
const title = "Domina OAB | Diagnóstico inteligente para a 1ª fase";
const description = "Transforme seu desempenho em um diagnóstico por tema, questões comentadas e um plano de estudos orientado para a 1ª fase da OAB.";
const socialImage = "https://www.dominaoab.com.br/og.png";

export const metadata: Metadata = {
  title,
  description,
  metadataBase:new URL("https://www.dominaoab.com.br"),
  keywords:["simulado OAB","OAB 1ª fase","questões OAB","diagnóstico OAB","questões comentadas OAB","plano de estudos OAB","Ética OAB"],
  icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"},
  openGraph:{title,description,type:"website",locale:"pt_BR",url:"https://www.dominaoab.com.br",images:[{url:socialImage,width:1200,height:630,alt:"Domina OAB — diagnóstico inteligente para a 1ª fase"}]},
  twitter:{card:"summary_large_image",title,description,images:[socialImage]},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}<AnalyticsTracker/></body></html>}
