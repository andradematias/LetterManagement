SELECT
    [Template Name],
    [License Types],
    [Manual Tokens]
FROM
    [Letter Template Lookup]
WHERE
    CHARINDEX(@Value, [License Types]) > 0
    OR [License Types] = 'All'
ORDER BY
    [Template Name]