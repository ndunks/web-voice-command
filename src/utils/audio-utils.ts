export function calcPeakMinRms(buffers: Float32Array): Record<string, number> {
    let min = 0, max = 0
    let squareSum = 0
    let sum = 0
    buffers.forEach(v => {

        squareSum += v * v
        sum += v
        if (v < min) {
            min = v
        } else if (v > max) {
            max = v
        }
    })
    // Rms
    const rms = squareSum / buffers.length
    const avg = sum / buffers.length

    return { min, max, rms, avg }
}

export function analyzeChunks() {

}
