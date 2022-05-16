Select
    [Display Value],
    [Options Value]
FROM
    [zDropDownListImport]
WHERE
    [List Name] = 'Home States'
    AND [Status] = 'Enabled'
    AND [Query Option] = @Value
ORDER BY
    [Position] DESC,
    [Display Value]