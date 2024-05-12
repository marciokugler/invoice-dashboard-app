
import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { CookiesProvider } from 'next-client-cookies/server';
import Script from 'next/script'; 


export const metadata: Metadata = {
  title: {
    template: '%s | Cisco Live 2024 Invoice App',
    default: 'Cisco Live 2024 Invoice App',
  },
  description: 'Cisco Live 2024 Invoice App',
  metadataBase: new URL('https://www.cisco.com'),
};


export default function RootLayout({children,}: {
  
  children: React.ReactNode;
}) {
  /*const scriptContent = `
  window.adrum||(function(d) {
    var o=adrum=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
    var c=d.createElement('script');o.api=[];c.async=true;c.type='text/javascript';
    c.crossOrigin='anonymous';c.src='https://cdn.appdynamics.com/adrum-otel/latest/adrum.js';h.appendChild(c);
  })(document);
  adrum('init', {
    appName: "invoice-app1",
    url: "https://fso-dpp.observe.appdynamics.com",
    sessionReplay: {
      maskAllText: true,
      maskAllInputs: true,
      packetAssets: true,
    }
  })
`;*/

const scriptContent = `
SplunkRum.init({
  realm: "us1",
  rumAccessToken: "SY8ZqV1LHQOTVKxSE7i9Dg",
  applicationName: "invoice-app",
  deploymentEnvironment: "lab"
});
`;
const scriptContent2 = `
SplunkSessionRecorder.init({
  app: "invoice-app",
  realm: "us1",
  rumAccessToken: "SY8ZqV1LHQOTVKxSE7i9Dg"
});
`;
const scriptContent4 = `
SplunkRum.init({
  realm: "us1",
  rumAccessToken: "SY8ZqV1LHQOTVKxSE7i9Dg",
  applicationName: "invoice-app",
  deploymentEnvironment: "lab"
});
`;

  return (
    
    
    <><head>
      
      
    
      {/*<script async src="https://cdn.signalfx.com/o11y-gdi-rum/v0.17.0/splunk-otel-web-session-recorder.js" />
      */}
      {/* <script dangerouslySetInnerHTML={{ __html: scriptContent3 }} />*/}
     {/*<script dangerouslySetInnerHTML={{ __html: scriptContent2}} />*/}
      <link rel="icon" href="/favicon.ico" />
      
      
    </head>
    <html lang="en">
        <body className={`${inter.className} antialiased`}><CookiesProvider>{children}</CookiesProvider>;
       

        </body>
          
      </html></>
      
  );
}