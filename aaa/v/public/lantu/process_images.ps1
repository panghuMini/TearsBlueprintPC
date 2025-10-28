# ================================
# 批量处理图片脚本
# 功能：
#   1. 去除黑色背景（设为透明）
#   2. 水平居中放置到 320x180 的透明画布
# 依赖：ImageMagick（magick 命令）
# 使用方式：
#   1. 将本脚本放在包含图片的文件夹内
#   2. 右键 -> 使用 PowerShell 运行
# ================================

# 获取当前文件夹内的所有图片（递归）
$images = Get-ChildItem -Path . -Include *.png,*.jpg,*.jpeg,*.bmp,*.webp -Recurse

foreach ($img in $images) {
    $outputPath = [System.IO.Path]::ChangeExtension($img.FullName, ".png")

    Write-Host "正在处理：$($img.FullName)"

    # 临时文件路径
    $tmpFile = "$($img.DirectoryName)\_tmp_$($img.Name)"

    # 第一步：去除黑色背景（接近黑色的区域变透明）
    magick "$($img.FullName)" -fuzz 10% -transparent black "$tmpFile"

    # 第二步：创建 320x180 的透明画布并水平居中
    magick convert -size 320x180 canvas:none "$tmpFile" -gravity center -compose over -composite -resize 320x180 "$outputPath"

    # 删除临时文件
    Remove-Item "$tmpFile" -Force
}

Write-Host "✅ 所有图片处理完成！"
