import filecmp
from os import path
from e2b import Session

async def test_download():
    file_name = "video.webm"
    local_dir = "tests/assets"

    local_path = path.join(local_dir, file_name)

    session = await Session.create("Nodejs")

    # Upload the file first (it's uploaded to /home/user)
    with open(local_path, "rb") as f:
        uploaded_file_path = session.upload_file(file=f)

    # Download the file back and save it in the local filesystem
    file_content = session.download_file(uploaded_file_path)
    with open(path.join(local_dir, "video-downloaded.webm"), 'wb') as f:
        f.write(file_content)


    # Compare the downloaded file with the original
    assert filecmp.cmp(local_path, path.join(local_dir, "video-downloaded.webm"))

    await session.close()
