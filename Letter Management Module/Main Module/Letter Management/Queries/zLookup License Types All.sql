SELECT
    [License Name],
    [Form ID]
FROM
    [License Lookup]
WHERE
    [Status] = 'Enabled'
order by
    case
        when [License Name] = 'All' then 1
        else 2
    end,
    [License Name] ASC