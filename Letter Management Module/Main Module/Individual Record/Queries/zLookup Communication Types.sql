Select
    [Display Value],
    [Options Value]
FROM
    [zDropDownListImport]
WHERE
    [List Name] = 'Communication Types'
    AND [Status] = 'Enabled'
    AND [Query Option] = @Value
ORDER BY
    [Display Value]