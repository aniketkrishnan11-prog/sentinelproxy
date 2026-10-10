const rules = [
  {
    name: 'SQL Injection - UNION-based',
    technique: 'T1190',
    severity: 'critical',
    pattern: /UNION\s+SELECT/i
  },
  {
    name: 'SQL Injection - boolean/comment-based',
    technique: 'T1190',
    severity: 'critical',
    pattern: /(\bOR\b\s+\d+\s*=\s*\d+)|(--\s*$)|(;\s*DROP\s+TABLE)/i
  },
  {
    name: 'SQL Injection - common keywords in unexpected context',
    technique: 'T1190',
    severity: 'high',
    pattern: /(\bSELECT\b.*\bFROM\b)|(\bINSERT\s+INTO\b)|(\bDELETE\s+FROM\b)/i
  },
  {
    name: 'XSS - script tag',
    technique: 'T1189',
    severity: 'critical',
    pattern: /<script[\s>]/i
  },
  {
    name: 'XSS - event handler injection',
    technique: 'T1189',
    severity: 'high',
    pattern: /on(error|load|click|mouseover|focus)\s*=/i
  },
  {
    name: 'XSS - javascript: URI',
    technique: 'T1189',
    severity: 'high',
    pattern: /javascript\s*:/i
  },
  {
    name: 'Path Traversal',
    technique: 'T1083',
    severity: 'high',
    pattern: /(\.\.\/)|(\.\.\\)|(%2e%2e%2f)/i
  },
  {
    name: 'Command Injection attempt',
    technique: 'T1059',
    severity: 'critical',
    pattern: /[;&|`]\s*(cat|ls|whoami|wget|curl|nc|bash|sh)\b/i
  }
];

module.exports = rules;
