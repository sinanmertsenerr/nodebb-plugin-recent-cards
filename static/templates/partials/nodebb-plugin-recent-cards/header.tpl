{{{ if topics.length }}}
<div class="recent-cards-plugin preventSlideout">
	<script type="application/json" class="rc-categories-data">{categories}</script>
	<script type="application/json" class="rc-widget-config">{widgetConfig}</script>

	<div class="rc-filter-bar d-flex align-items-center justify-content-between mb-2">
		<h5 class="mb-0 flex-grow-1">{{{ if title }}}{title}{{{ else }}}Son Paylaşımlar{{{ end }}}</h5>
		<div class="rc-filter-wrapper position-relative flex-shrink-0">
			<button class="rc-filter-btn btn btn-sm d-flex align-items-center gap-1"
					type="button"
					aria-haspopup="listbox"
					aria-expanded="false">
				<i class="fa fa-sliders fa-xs"></i>
				<span class="rc-filter-label">Filtrele</span>
				<i class="fa fa-caret-down fa-xs rc-caret"></i>
			</button>
			<div class="rc-filter-dropdown border rounded shadow-sm position-absolute d-none" role="listbox" aria-label="Category filter">
				<div class="rc-filter-dropdown-inner"></div>
			</div>
		</div>
	</div>

	<div class="{{{ if !carouselMode }}}row{{{ else }}}d-flex gap-3{{{ end }}} recent-cards carousel-mode overflow-hidden invisible" itemscope itemtype="http://www.schema.org/ItemList" {{{ if carouselMode }}}style=""{{{ end }}}>
		{{{ each topics }}}
		<div class="{{{ if !carouselMode }}}col-lg-3 col-sm-6 col-12 overflow-hidden{{{ end }}} recent-card-container {{{ if ./showThumbnailInBackground }}}thumb-bg{{{ end }}}" data-cid="{./category.cid}">
			<div class="recent-card card card-header border-0 rounded mb-2 p-0 position-relative d-inline-flex {{{ if !carouselMode }}}w-100{{{ end }}}" style="{{{ if ./showThumbnailInBackground }}}background-image: url('{./thumbs.0.url}');{{{ end }}}{{{ if carouselMode }}}width: 312px;{{{ end }}}">
				<div class="glass-layer rounded p-2">
					<div class="recent-card-body h-100 overflow-hidden">
						<div>
							<h6 class="topic-title mt-0 text-truncate"><a class="text-reset" href="{config.relative_path}/topic/{./slug}{{{ if ./bookmark }}}/{./bookmark}{{{ end }}}" title="{stripTags(./title)}">{./title}</a></h6>
						</div>
						<div class="d-flex flex-column gap-1">
							<div class="d-flex gap-2 align-items-center">
								<a class="text-decoration-none" href="{config.relative_path}/user/{./teaser.user.userslug}">{buildAvatar(./teaser.user, "24px", true, "avatar-tooltip")}</a>
								<a class="flex-shrink-1 text-xs text-truncate text-reset" href="{config.relative_path}/user/{./teaser.user.userslug}">{./teaser.user.displayname}</a>
								<span class="flex-shrink-0 timeago text-muted text-xs" title="{./teaser.timestampISO}"></span>
							</div>
							<div class="text-sm text-break line-clamp-5" style="transform: rotate(0);">
								<a href="{config.relative_path}/topic/{./slug}{{{ if ./bookmark }}}/{./bookmark}{{{ end }}}" class="stretched-link"></a>
								{{{ if ./showThumbnailInline }}}
								<a href="{config.relative_path}/post/{./mainPid}"><img src="{./thumbs.0.url}" class="mw-100" alt="[[topic:thumb-image]]"/></a>
								{{{ else }}}
								<div class="teaser-content">{./teaser.content}</div>
								{{{ end }}}
							</div>
						</div>
					</div>

					<div class="d-flex mt-3 align-items-center gap-2">
						<div class="d-flex category-item text-truncate">
							{buildCategoryLabel(./category, "a", "border")}
						</div>
						<div class="badge text-body border border-gray-300 stats text-xs">
							<span title="{formattedNumber(./postcount)}" class="fw-bold">{humanReadableNumber(./postcount)}</span>
							<span class="text-lowercase fw-normal">[[global:posts]]</span>
						</div>
						<div class="badge text-body border border-gray-300 stats text-xs">
							<span title="{formattedNumber(./votes)}" class="fw-bold">{humanReadableNumber(./votes)}</span>
							<span class="text-lowercase fw-normal">[[global:votes]]</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		{{{end}}}
	</div>
	<div class="rc-empty-state d-none text-center text-muted py-4">
		<i class="fa fa-filter fa-2x mb-2 d-block"></i>
		<span>Secilen filtrelere uygun konu bulunamadi.</span>
	</div>
</div>
{{{end}}}
