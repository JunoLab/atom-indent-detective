describe("Activation Benchmark", () => {
    it("should measure and log the time activation", async function () {

        // This makes the log visible again from the command line.
        spyOn(console, 'log').and.callThrough();

        await atom.packages.activatePackage("status-bar")
        console.log("\n Activation Benchmark Started")

        measure("Activation Time", async function activationBenchmark() {
                await atom.packages.activatePackage("indent-detective")
            }
        )
        console.log("\n Finished")
    })
})

