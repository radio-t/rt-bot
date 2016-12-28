using System.Collections.Generic;
using System.Diagnostics;
using Microsoft.Extensions.Logging;

namespace Bot4Bots.Github
{
    public class GithubService
    {
        private volatile IReadOnlyCollection<GithubBotSummary> _summaries = new GithubBotSummary[0];

        private readonly GithubGateway _gateway;
        private readonly ILogger _logger;

        public GithubService(GithubGateway gateway, ILogger<GithubGateway> logger)
        {
            _gateway = gateway;
            _logger = logger;
        }

        public IReadOnlyCollection<GithubBotSummary> GetSummaries()
        {
            return _summaries;
        }

        public void LoadSummaries()
        {
            var ts = Stopwatch.StartNew();
            _logger.LogInformation("Loading bots from Github..");

            _summaries = _gateway.GetSummary();

            ts.Stop();
            _logger.LogInformation("{0} bots were loaded from Github in {1}", _summaries.Count, ts.Elapsed);
        }
    } 
}
