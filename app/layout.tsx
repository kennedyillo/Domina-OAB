import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "./globals.css";
import "./domina-redesign.css";
import "./contrast-fixes.css";
import "./accessibility.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

const title = "Domina OAB | Diagnóstico inteligente para a 1ª fase";
const description = "Transforme cada resposta em um mapa de domínio da 1ª fase, com diagnóstico por tema, questões comentadas e um plano de estudos orientado pelo seu desempenho.";
const socialImage = "https://www.dominaoab.com.br/og.png";

export const metadata: Metadata = {
  title,
  description,
  metadataBase:new URL("https://www.dominaoab.com.br"),
  keywords:["simulado OAB","OAB 1ª fase","questões OAB","diagnóstico OAB","questões comentadas OAB","plano de estudos OAB","Ética OAB"],
  icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"},
  openGraph:{title,description,type:"website",locale:"pt_BR",url:"https://www.dominaoab.com.br",images:[{url:socialImage,width:1200,height:630,alt:"Domina OAB — inteligência de desempenho para dominar a 1ª fase"}]},
  twitter:{card:"summary_large_image",title,description,images:[socialImage]},
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return <html lang="pt-BR"><body className={`${inter.variable} ${outfit.variable}`}><a className="skip-link" href="#conteudo-principal">Pular para o conteúdo principal</a><div id="conteudo-principal" tabIndex={-1}>{children}</div><AnalyticsTracker/></body></html>;
}
