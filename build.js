// See https://github.com/Yuezi32/vite-vue-crx-2023autumn/
import fs from 'fs'
import path from 'path'
import { CRX_OUTDIR, CRX_CONTENT_OUTDIR, CRX_BACKGROUND_OUTDIR } from './globalConfig.js'

const copyDirectory = (srcDir, destDir) => {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir)
    }

    fs.readdirSync(srcDir).forEach((file) => {
        const srcPath = path.join(srcDir, file)
        const destPath = path.join(destDir, file)

        if (fs.lstatSync(srcPath).isDirectory()) {
            // copy recursively
            copyDirectory(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    })
}

const deleteDirectory = (dir) => {
    if(fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file) => {
            const curPath = path.join(dir, file)
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteDirectory(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(dir)
    }
}

const contentOutDir = path.resolve(process.cwd(), CRX_CONTENT_OUTDIR)
const backgroundOutDir = path.resolve(process.cwd(), CRX_BACKGROUND_OUTDIR)
const outDir = path.resolve(process.cwd(), CRX_OUTDIR)

// copy temp build directory to final output directory
copyDirectory(contentOutDir, outDir)
copyDirectory(backgroundOutDir, outDir)

// remove temp directory
deleteDirectory(contentOutDir)
deleteDirectory(backgroundOutDir)
