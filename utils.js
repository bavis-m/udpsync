function mergeWithSubkeys(a, b, subkeys)
{
    let mergedSubkeys = {};
    if (typeof subkeys == 'object')
    {
        for (let key in subkeys)
        {
            mergedSubkeys[key] = mergeSettings(a[key], b[key], subkeys[key]);
        }
    }
    return { ...a, ...b, ...mergedSubkeys };
}

module.exports = { mergeWithSubkeys };
