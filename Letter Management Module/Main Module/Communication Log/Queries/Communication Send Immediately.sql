SELECT
    TOP 1000 *
FROM
    [Communications Log]
WHERE
    [Communication Type] = 'Email'
    AND [Scheduled Date] < GetDate()
    AND [Approved] = 'Yes'
    AND [Communication Sent] <> 'Yes'
    AND [Email Type] = 'Immediate Send'
    AND (
        [Email Recipients] like '%procom%'
        OR [Email Recipients] like '%visualvault%'
        OR [Email Recipients] like '%uat%'
        OR [Email Recipients] like '%nebraska.gov%'
    )
ORDER BY
    [Email Recipients],
    [Subject]