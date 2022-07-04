Select
    [Display Value],
    [Options Value]
FROM
    [zDropDownListImport]
WHERE
    [List Name] = 'Countries'
    and [Status] = 'Enabled'
ORDER BY
    [Position] Desc,
    [Display Value] Asc