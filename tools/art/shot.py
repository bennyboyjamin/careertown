import asyncio, sys
from playwright.async_api import async_playwright
async def main(src,out):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        pg=await b.new_page(viewport={'width':int(sys.argv[3]) if len(sys.argv)>3 else 384,'height':int(sys.argv[4]) if len(sys.argv)>4 else 962},device_scale_factor=1)
        await pg.goto('file://'+src); await pg.screenshot(path=out,omit_background=True); await b.close()
asyncio.run(main(sys.argv[1],sys.argv[2]))
