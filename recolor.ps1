$dark  = '#1B1A18'
$light = '#FBF6E8'

function Apply-Replacements($content) {
  $c = $content

  # --- DARK ---
  $darkList = @(
    '#6b0f1a','#6B0F1A','#741827','#7a1e1e','#1a1a1a','#1A1A1A',
    '#2b2a27','#282828','#2a120c','#2a120d','#35180f','#2a1a14',
    '#1a1210','#1a1008','#1a0c04','#0c0704','#080400','#111111',
    '#3a1820','#5a1820','#3a1e0c','#3d2010','#3d2818','#3d2b1f',
    '#4a2808','#4a2028','#4a3020','#49323b','#5a342a','#5c3325',
    '#5c3d28','#5a2840','#6b3528','#6b3544','#6b4a30','#6a4860',
    '#6a4870','#6f4428','#643640','#6b1f2a','#6E6E6E','#6e6e6e',
    '#7a4850','#7a4f56','#7a5448','#7a5c5f','#7a6888','#7d5142',
    '#77706a','#806958','#8a5858','#8a5868','#8a5c34','#8a6248',
    '#8a6a48','#8a6860','#8a9868','#9a6870','#9a7888','#a07850',
    '#aeb997','#ad8d88','#b98d8b','#b98962','#b88478','#bd8793',
    '#667255','#e82e76','#b1245e','#f0522b','#c2371a','#c8801e',
    '#6f7548','#3b2a20','#4e0f1a','#2a1810','#2e1018','#3a2018',
    '#1d1512','#1D1512','#2a1f1a','#4a3b34'
  )
  foreach ($h in $darkList) { $c = $c.Replace($h, $dark) }

  # --- LIGHT ---
  $lightList = @(
    '#faf8f4','#fffaf2','#fff7ec','#f8f6ed','#f7f1e8','#f4ecd7',
    '#f7efe4','#f2efe8','#fffdf8','#fbf2e6','#fbf6e9',
    '#eee0d2','#eee2d2','#efe0d8','#eaded1','#e8ddd2','#ead8c4',
    '#ead6dc','#e6d8c8','#efd8a8','#eee3c6','#e6d7b0',
    '#dce6d2','#d4bcc8','#d4b894','#d4a59a','#cf9f86','#cfc3b0',
    '#d8c8c0','#d4c0c8','#c4a8b4','#c4a882','#c8b4a8','#c8afa1',
    '#c9b296','#c9a2a4','#c09252','#b4a4c4','#b8a4b0',
    '#feecde','#ffd353','#ffffff','#FFFFFF'
  )
  foreach ($h in $lightList) { $c = $c.Replace($h, $light) }

  # #fff word boundary
  $c = $c -creplace '#fff(?![0-9a-fA-F])', $light

  # rgba dark
  $c = $c -replace 'rgba\(116,\s*24,\s*39,\s*([\d.]+)\)',   'rgba(27, 26, 24, $1)'
  $c = $c -replace 'rgba\(107,\s*15,\s*26,\s*([\d.]+)\)',   'rgba(27, 26, 24, $1)'
  $c = $c -replace 'rgba\(20,\s*14,\s*10,\s*([\d.]+)\)',    'rgba(27, 26, 24, $1)'
  $c = $c -replace 'rgba\(53,\s*24,\s*15,\s*([\d.]+)\)',    'rgba(27, 26, 24, $1)'
  $c = $c -replace 'rgba\(20,\s*12,\s*10,\s*([\d.]+)\)',    'rgba(27, 26, 24, $1)'
  $c = $c -replace 'rgba\(28,\s*21,\s*18,\s*([\d.]+)\)',    'rgba(27, 26, 24, $1)'
  $c = $c -replace 'rgba\(0,\s*0,\s*0,\s*([\d.]+)\)',       'rgba(27, 26, 24, $1)'
  $c = $c -replace 'rgba\(40,\s*40,\s*40,\s*([\d.]+)\)',    'rgba(27, 26, 24, $1)'

  # rgba light
  $c = $c -replace 'rgba\(255,\s*255,\s*255,\s*([\d.]+)\)', 'rgba(251, 246, 232, $1)'
  $c = $c -replace 'rgba\(247,\s*241,\s*232,\s*([\d.]+)\)', 'rgba(251, 246, 232, $1)'
  $c = $c -replace 'rgba\(251,\s*242,\s*230,\s*([\d.]+)\)', 'rgba(251, 246, 232, $1)'

  return $c
}

$cssFiles = Get-ChildItem 'D:\Проекты\paloma-static\*.css' -File

foreach ($file in $cssFiles) {
  $content  = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $newContent = Apply-Replacements $content
  if ($newContent -ne $content) {
    [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Updated: $($file.Name)"
  }
}
Write-Host 'Done.'
