#!/bin/bash
SRC="/Users/adam/.gemini/antigravity/brain/7994b3d5-3933-4d1c-8a25-bb077641d441/.system_generated/steps/139/content.md"
OUT="/Users/adam/Desktop/New project/data.js"

echo "const RAW_DATA = [" > "$OUT"

# Process each data row
grep -E '^\s*"[0-9]+' "$SRC" | while IFS= read -r line; do
    # Skip Grand Total
    echo "$line" | grep -q "Grand Total" && continue
    
    # Parse using awk
    echo "$line" | awk -F'","' '
    {
        gsub(/^"/,"",$1); gsub(/"$/,"",$(NF))
        id=$1; dist=$2; bc=$3
        # Remove commas from numbers
        for(i=4;i<=NF;i++) { gsub(/,/,"",$i); gsub(/"/,"",$i) }
        s1=$4; k1=$5; s2=$6; k2=$7; s3=$8; k3=$9; s4=$10; k4=$11
        s5=$12; k5=$13; s6=$14; k6=$15; s7=$16; k7=$17
        prov=$18
        if(id+0 > 0 && id+0 < 171) {
            printf "{i:%d,d:\"%s\",b:\"%s\",p:\"%s\",s:[%s,%s,%s,%s,%s,%s,%s],k:[%s,%s,%s,%s,%s,%s,%s]},\n",id+0,dist,bc,prov,s1+0,s2+0,s3+0,s4+0,s5+0,s6+0,s7+0,k1+0,k2+0,k3+0,k4+0,k5+0,k6+0,k7+0
        }
    }'
done >> "$OUT"

echo "];" >> "$OUT"
echo "Done: $(grep -c '{i:' "$OUT") records"
