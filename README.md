# Statistics server (for UniGetUI)

⚠️ **This is under development. This may be scrapped at some point. Consider this repo an experiment.** ⚠️

A simple statistics server built with TypeScript to collect and analyze **anonymous** usage data from UniGetUI, with the end of understaning how users use the app, which features are used more or less, and perhaps create open/public package rankings, based on data collected from UniGetUI users (most installed pacjage(s), etc.)

See more details about statistics/telemetry on UniGetUI here: https://github.com/marticliment/UniGetUI/discussions/2706


## Run the server
1. Configure HOST, PORT and other settings on `src/Settings.ts`
2. Run `cd src; npm run server`, You should now be ready to go


## API Spec
See the API specification here: 
 - [YAML](https://github.com/marticliment/Statistics-Server/blob/main/src/apispec.yaml)
 - [HTML (You will need to save the file as a html file)](https://raw.githubusercontent.com/marticliment/Statistics-Server/refs/heads/main/src/index.html)
