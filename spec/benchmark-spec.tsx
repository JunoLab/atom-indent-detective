import path from "path"

describe("Activation Benchmark", () => {

    beforeEach(async () => {
        jasmine.attachToDOM(atom.views.getView(atom.workspace))
        // Activate Packages
        await atom.packages.activatePackage("status-bar")
        atom.packages.triggerActivationHook('core:loaded-shell-environment');
    })

    it("should measure and log the time activation", async function () {

        // This makes the log visible again from the command line.
        spyOn(console, 'log').and.callThrough();

        console.log("\n Activation Benchmark Started")
        window.measure("Activation Time", async function activationBenchmark() {
            await atom.packages.activatePackage("indent-detective")
        })
        expect(atom.packages.isPackageLoaded("indent-detective")).toBeTruthy()
        atom.packages.triggerDeferredActivationHooks();

        console.log("\n Finished")
    })
})


describe("Opening Benchmark", () => {

    beforeEach(async () => {
        jasmine.attachToDOM(atom.views.getView(atom.workspace))
        // Activate Packages
        await atom.packages.activatePackage("status-bar")
        atom.packages.triggerActivationHook('core:loaded-shell-environment');
        await atom.packages.activatePackage("indent-detective")
        expect(atom.packages.isPackageLoaded("indent-detective")).toBeTruthy()
        atom.packages.triggerDeferredActivationHooks();
    })

    it("should measure and log the time activation", async function () {
        const filepath = path.join(__dirname, "files", "AcuteML.jl")

        // This makes the log visible again from the command line.
        spyOn(console, 'log').and.callThrough();

        console.log("\n Opening Benchmark Started")

        window.measure("Opening Time", async function OpeningBenchmark() {
            // Open AcuteML.jl
             await atom.workspace.open(filepath)
            }
        )
        console.log("\n Finished")
    })
})
