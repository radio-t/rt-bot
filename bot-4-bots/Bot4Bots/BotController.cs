using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Bot4Bots.Github;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Bot4Bots
{
    [Route("")]
    public class BotController : Controller
    {
        private static readonly Dictionary<string,string> BotsStatsCommands = new Dictionary<string, string>
        {
            { "/bots stats", "returns bot's stats from Github: created date, last changed date etc.." },
            { "/статистика ботов", "возвращает информацию о боте из Github: когда и кем бот был создан и последний раз изменен" }
        };

        private readonly GithubService _githubService;
        private readonly ILogger _logger;
        
        public BotController(GithubService githubService, ILogger<BotController> logger)
        {
            _githubService = githubService;
            _logger = logger;
        }

        [HttpGet("info")]
        public InfoModel Info(int id)
        {
            return new InfoModel
            {
                Author = "khaale",
                Info = "bot-4-bots - показывает расширенную информацию о ботах",
                Commands = BotsStatsCommands.Select(x => $"{x.Key} - {x.Value}").ToArray()
            };
        }
        
        [HttpPost("event")]
        public IActionResult Event([FromBody] EventModel evt)
        {
            _logger.LogDebug($"Received event, text: '{evt.Text}'");
            if (IsBotsStatsRequest(evt))
            {
                _logger.LogDebug("Getting new bots");
                var message = GetBotsStats();
                var messageModel = new EventResponseModel
                {
                    Text = message,
                    Bot = "bot4bots"
                };

                return Ok(messageModel);
            }
            else
            {
                return StatusCode((int)HttpStatusCode.ExpectationFailed);
            }
        }

        private bool IsBotsStatsRequest(EventModel evt)
        {
            return BotsStatsCommands.Keys.Contains(evt.Text?.Trim());
        }

        private string GetBotsStats()
        {
            var githubBotSummaries = _githubService.GetSummaries();

            if (!githubBotSummaries.Any())
            {
                return "Sorry, Github data have not been loaded yet :(";
            }

            var tableRows = (
                from bi in githubBotSummaries
                orderby bi.CreatedBy?.CommitDate descending
                select $"[{bi.Name}]({bi.Link})|" +
                    $"{bi.CreatedBy?.CommitDate:d}|{bi.CreatedBy?.User}|" +
                    $"{bi.LastChangedBy?.CommitDate:d}|{bi.LastChangedBy?.User}|"
                ).ToList();

            var tableHeader = new[]
            {
                    "Bot Name | Created On &darr; | Created By | Last Changed On | Last Changed By",
                    "---------|-------------------|------------|-----------------|----------------"
                };

            var message = string.Join(Environment.NewLine, tableHeader.Concat(tableRows));

            return message;
        }

        public class InfoModel
        {
            [JsonProperty("author")] public string Author { get; set; }
            [JsonProperty("info")] public string Info { get; set; }
            [JsonProperty("commands")] public string[] Commands { get; set; }
        }
        
        public class EventModel
        {
            [JsonProperty("text")] public string Text { get; set; }
            [JsonProperty("username")] public string UserName { get; set; }
            [JsonProperty("display_name")] public string[] DisplayName { get; set; }
        }

        public class EventResponseModel
        {
            [JsonProperty("text")] public string Text { get; set; }
            [JsonProperty("bot")] public string Bot { get; set; }
        }
    }
}
