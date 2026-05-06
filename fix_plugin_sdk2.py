with open('frontend/src/app/workspace/plugin-sdk/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line replacements (1-based indexing)
replacements = {
    125: "    this.pluginName = context.manifest.name;\n",
    129: '    console.log(this.pluginName + " activated");\n',
    132: "    this.context.hooks.on('before-message', this.onBeforeMessage.bind(this));\n",
    133: "    this.context.hooks.on('after-message', this.onAfterMessage.bind(this));\n",
    137: '    console.log(this.pluginName + " deactivated");\n',
    159: "  private pluginName: string;\n",
    163: "    this.pluginName = context.manifest.name;\n",
    167: '    console.log(this.pluginName + " activated");\n',
    169: "    this.context.hooks.on('before-message', this.onBeforeMessage);\n",
    170: "    this.context.hooks.on('after-message', this.onAfterMessage);\n",
    174: '    console.log(this.pluginName + " deactivated");\n',
}

for line_num, new_line in replacements.items():
    idx = line_num - 1
    if idx < len(lines):
        old = lines[idx]
        lines[idx] = new_line
        print(f'Replaced line {line_num}: {repr(old)} -> {repr(new_line)}')
    else:
        print(f'Line {line_num} out of range')

with open('frontend/src/app/workspace/plugin-sdk/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Done')
