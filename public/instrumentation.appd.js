
require("appdynamics").profile({
    controllerHostName: 'fso-tme.saas.appdynamics.com',
    controllerPort: 443,
    
    // If SSL, be sure to enable the next line
    controllerSslEnabled: true,
    secureAppEnabled: true,
    accountName: 'fso-tme',
    accountAccessKey: 'uylojnqg6e81',
    applicationName: 'invoice-app',
    tierName: 'nextjs',
    nodeName: 'process' // The controller will automatically append the node name with a unique number
   });


   