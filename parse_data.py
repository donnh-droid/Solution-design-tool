import csv
import json
import io
import re

# Read the raw content
with open('/Users/adam/.gemini/antigravity/brain/7994b3d5-3933-4d1c-8a25-bb077641d441/.system_generated/steps/139/content.md', 'r') as f:
    content = f.read()

# Find CSV lines (skip the markdown header)
lines = content.split('\n')
csv_lines = []
for line in lines:
    if line.startswith('"'):
        csv_lines.append(line)

def parse_num(s):
    s = s.strip().replace('"', '').replace(',', '')
    if not s:
        return 0
    try:
        return int(s)
    except:
        try:
            return float(s)
        except:
            return 0

# Parse data rows (skip header rows 0-3)
data = []
for line in csv_lines[4:]:  # Skip 4 header rows
    reader = csv.reader(io.StringIO(line))
    for row in reader:
        if len(row) < 17:
            continue
        idx = row[0].strip()
        if not idx or not idx.isdigit():
            continue
        if 'Grand Total' in row[1]:
            continue
        
        district = row[1].strip()
        bc_name = row[2].strip()
        
        # Weekly data: columns 3-16 are pairs (SL, KL) for 7 weeks
        weekly_sl = []
        weekly_kl = []
        for w in range(7):
            sl_idx = 3 + w * 2
            kl_idx = 4 + w * 2
            if sl_idx < len(row):
                weekly_sl.append(parse_num(row[sl_idx]))
            else:
                weekly_sl.append(0)
            if kl_idx < len(row):
                weekly_kl.append(parse_num(row[kl_idx]))
            else:
                weekly_kl.append(0)
        
        # Province is in column 17
        province = row[17].strip() if len(row) > 17 else ''
        
        if not province:
            # Try to infer from BC name
            if 'HCM' in bc_name or 'Hồ Chí Minh' in bc_name:
                province = 'Hồ Chí Minh'
            elif 'Bình Dương' in bc_name:
                province = 'Bình Dương'
            elif 'Bà Rịa' in bc_name or 'Vũng Tàu' in bc_name:
                province = 'Bà Rịa - Vũng Tàu'
        
        data.append({
            'id': int(idx),
            'd': district,
            'bc': bc_name,
            'p': province,
            'sl': weekly_sl,
            'kl': weekly_kl
        })

# Write data.js
with open('/Users/adam/Desktop/New project/data.js', 'w') as f:
    f.write('const RAW_DATA = ')
    f.write(json.dumps(data, ensure_ascii=False, indent=None))
    f.write(';\n')

print(f"Exported {len(data)} records to data.js")
