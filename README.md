# Statistics server (for UniGetUI)

⚠️ **This is under development. This may be scrapped at some point. Consider this repo an experiment.** ⚠️

A simple statistics server built with TypeScript to collect and analyze **anonymous** usage data from UniGetUI, with the end of understaning how users use the app, which features are used more or less, and perhaps create open/public package rankings, based on data collected from UniGetUI users (most installed pacjage(s), etc.)

See more details about statistics/telemetry on UniGetUI here: https://github.com/marticliment/UniGetUI/discussions/2706

## Run the server
1. Configure HOST, PORT and other settings on `src/Settings.ts`
3. Run `node .\src\server.ts`, You should now be ready to go
