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

class Timer
{
    constructor(millis)
    {
        this.resolved = false;
        this.canceled = false;
        this.handle = setTimeout(() => {
            this.handle = undefined;
            this.resolved = true;
            if (this.resolve)
            {
                this.resolve();
                this.resolve = this.reject = undefined;
            }
        }, millis);
    }

    cancel()
    {
        if (this.handle)
        {
            clearTimeout(this.handle);
            this.handle = undefined;
            this.canceled = true;
            if (this.reject)
            {
                this.reject();
                this.reject = this.resolve = undefined;
            }
        }
    }

    then(resolve, reject)
    {
        if (this.resolved)
        {
            resolve();
        }
        else if (this.canceled)
        {
            reject();
        }
        else
        {
            this.resolve = resolve;
            this.reject = reject;
        }
    }
}

function sleepAsync(ms)
{
    return new Timer(ms);
}

module.exports = { mergeWithSubkeys, sleepAsync };
