'use strict';

$(document).ready(function () {
	const rtl = $('html').attr('data-dir') === 'rtl';
	const arrowClasses = 'link-secondary position-absolute top-50 translate-middle-y p-1 z-1';
	const nextIcon = rtl ? 'fa-chevron-left' : 'fa-chevron-right';
	const prevIcon = rtl ? 'fa-chevron-right' : 'fa-chevron-left';
	const nextArrow = `<a href="#" class="${arrowClasses} slick-next" title="">
			<i class="fa-solid fa-fw ${nextIcon} fa-lg"></i>
		</a>`;
	const prevArrow = `<a href="#" class="${arrowClasses} slick-prev" title="">
			<i class="fa-solid fa-fw ${prevIcon} fa-lg"></i>
		</a>`;

	async function initSlick(container) {
		if (!container.length || container.hasClass('slick-initialized')) {
			return;
		}

		if (!config.recentCards || !config.recentCards.enableCarousel) {
			container.removeClass('carousel-mode invisible');
			return;
		}

		const slideCount = parseInt(config.recentCards.maxSlides, 10) || 4;
		const slideMargin = 16;
		const env = utils.findBootstrapEnvironment();
		if (['xxl', 'xl', 'lg'].includes(env)) {
			const cards = container.find('.recent-card-container .recent-card');
			const cardCount = Math.min(cards.length, slideCount);
			if (cardCount > 0) {
				cards.css({
					width: (container.width() - ((cardCount - 1) * slideMargin)) / cardCount,
				});
			}
		}
		container.slick({
			infinite: false,
			slidesToShow: slideCount,
			slidesToScroll: slideCount,
			rtl: rtl,
			variableWidth: true,
			dots: !!config.recentCards.enableCarouselPagination,
			nextArrow: nextArrow,
			prevArrow: prevArrow,
			responsive: [{
				breakpoint: 992, // md
				settings: {
					slidesToShow: 3,
					slidesToScroll: 2,
					infinite: false,
				},
			}, {
				breakpoint: 768, // sm/xs
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1,
					infinite: false,
				},
			}],
		});

		container.removeClass('overflow-hidden invisible');
		container.find('.slick-prev').translateAttr('title', '[[global:pagination.previouspage]]');
		container.find('.slick-next').translateAttr('title', '[[global:pagination.nextpage]]');
	}

	// --- Category Filter ---

	const isMobile = () => window.innerWidth < 576;

	function openDropdown(pluginContainer) {
		const dropdown = pluginContainer.find('.rc-filter-dropdown');
		const btn = pluginContainer.find('.rc-filter-btn');
		dropdown.removeClass('d-none');
		btn.attr('aria-expanded', 'true');

		// On mobile: add backdrop and lock body scroll
		if (isMobile()) {
			const backdrop = $('<div class="rc-backdrop"></div>');
			backdrop.on('click', function () {
				closeAllDropdowns();
			});
			pluginContainer.find('.rc-filter-wrapper').append(backdrop);
			document.body.style.overflow = 'hidden';
		}
	}

	function closeAllDropdowns() {
		$('.rc-filter-dropdown').addClass('d-none');
		$('.rc-filter-btn').attr('aria-expanded', 'false');
		$('.rc-backdrop').remove();
		document.body.style.overflow = '';
	}

	// No localStorage — filter resets on page reload (F5)

	function buildDropdown(pluginContainer, categories, selectedCids) {
		const inner = pluginContainer.find('.rc-filter-dropdown-inner');
		inner.empty();

		// Sticky header with reset link
		const header = $('<div class="rc-filter-header d-flex align-items-center justify-content-between px-3 py-2"></div>');
		header.append($('<span class="text-muted text-xs fw-semibold text-uppercase"></span>').text('Kategoriler'));
		header.append($('<button type="button" class="btn btn-link btn-sm rc-clear-all text-decoration-none p-0 text-xs"></button>').text('Temizle'));
		inner.append(header);

		// Scrollable category list
		const list = $('<div class="rc-filter-dropdown-list"></div>');

		categories.forEach(function (cat) {
			const isChecked = selectedCids ? selectedCids.includes(cat.cid) : false;
			const item = $('<label class="rc-filter-option d-flex align-items-center gap-2 px-3 py-2"></label>');
			const checkbox = $('<input type="checkbox" class="form-check-input mt-0">')
				.attr('data-cid', cat.cid)
				.prop('checked', isChecked);

			const nameSpan = $('<span class="badge"></span>')
				.css({ backgroundColor: cat.bgColor || '#6c757d', color: cat.color || '#fff' })
				.text(cat.name);

			item.append(checkbox);
			if (cat.icon) {
				item.append($('<i></i>').addClass('fa').addClass(cat.icon).css('color', cat.bgColor || '#6c757d'));
			}
			item.append(nameSpan);
			list.append(item);
		});

		inner.append(list);
	}

	function updateFilterButton(pluginContainer, selectedCids, categories) {
		const btn = pluginContainer.find('.rc-filter-btn');
		const activeCount = selectedCids ? selectedCids.length : 0;
		const isFiltered = activeCount > 0 && activeCount < categories.length;
		btn.toggleClass('rc-filter-active', isFiltered);
		const label = btn.find('.rc-filter-label');
		label.text(isFiltered ? 'Filtrele (' + activeCount + ')' : 'Filtrele');
	}

	function parseWidgetConfig(pluginContainer) {
		const scriptTag = pluginContainer.find('script.rc-widget-config');
		if (!scriptTag.length) return {};
		try {
			return JSON.parse(scriptTag.text()) || {};
		} catch (e) {
			return {};
		}
	}

	function applyFilter(pluginContainer, selectedCids, categories) {
		const carouselContainer = pluginContainer.find('.recent-cards');
		const isCarouselMode = config.recentCards && config.recentCards.enableCarousel;
		const showAll = !selectedCids || selectedCids.length === 0 || selectedCids.length === categories.length;
		const emptyState = pluginContainer.find('.rc-empty-state');
		const widgetCfg = parseWidgetConfig(pluginContainer);

		// Update button immediately
		updateFilterButton(pluginContainer, selectedCids, categories);

		// If showing all, and we have the original cards stashed, restore them
		if (showAll && pluginContainer.data('rc-original-cards')) {
			swapCards(carouselContainer, emptyState, pluginContainer.data('rc-original-cards'), isCarouselMode);
			return;
		}

		if (showAll) {
			return; // nothing to filter, initial load handles it
		}

		// Stash original cards on first filter
		if (!pluginContainer.data('rc-original-cards')) {
			pluginContainer.data('rc-original-cards', carouselContainer.html());
		}

		// Abort any in-flight request (safe to call on completed/null)
		const prevXhr = pluginContainer.data('rc-xhr');
		if (prevXhr) {
			prevXhr.abort();
			pluginContainer.removeData('rc-xhr');
		}

		// Keep old cards visible while loading — no blank flash
		const params = $.param({
			cids: selectedCids.join(','),
			sort: widgetCfg.sort || 'recent',
			teaserPost: widgetCfg.teaserPost || 'first',
			teaserParseType: widgetCfg.teaserParseType || 'default',
			thumbnailStyle: widgetCfg.thumbnailStyle || 'background',
		});

		const xhr = $.getJSON(config.relative_path + '/plugins/nodebb-plugin-recent-cards/filter?' + params)
			.done(function (data) {
				const parsed = $('<div>').html(data.html);
				const newCards = parsed.find('.recent-cards').html();

				if (!newCards || !newCards.trim()) {
					destroySlick(carouselContainer);
					emptyState.removeClass('d-none');
					carouselContainer.addClass('d-none');
					return;
				}

				// Translate, then do instant swap (destroy → replace → reinit in one tick)
				require(['translator'], function (translator) {
					translator.Translator.create().translate(newCards).then(function (translated) {
						swapCards(carouselContainer, emptyState, translated, isCarouselMode);
					}).catch(function () {
						swapCards(carouselContainer, emptyState, newCards, isCarouselMode);
					});
				});
			})
			.fail(function (jqXHR, textStatus) {
				if (textStatus === 'abort') return;
				// On error, keep current cards as-is
			})
			.always(function () {
				pluginContainer.removeData('rc-xhr');
			});

		pluginContainer.data('rc-xhr', xhr);
	}

	function swapCards(carouselContainer, emptyState, html, isCarouselMode) {
		// Instant swap: destroy → replace → reinit in one synchronous block (no blank flash)
		destroySlick(carouselContainer);
		emptyState.addClass('d-none');
		carouselContainer.removeClass('d-none').html(html);
		carouselContainer.find('.timeago').timeago();

		if (isCarouselMode) {
			carouselContainer.addClass('overflow-hidden invisible');
			initSlick(carouselContainer);
		} else {
			carouselContainer.removeClass('carousel-mode invisible overflow-hidden');
		}
	}

	function destroySlick(container) {
		if (container.hasClass('slick-initialized')) {
			try {
				container.slick('unslick');
			} catch (e) {
				// Slick was not properly initialized
			}
		}
	}

	function parseCategories(pluginContainer) {
		const scriptTag = pluginContainer.find('script.rc-categories-data');
		if (!scriptTag.length) return [];
		try {
			const parsed = JSON.parse(scriptTag.text());
			return Array.isArray(parsed) ? parsed : [];
		} catch (e) {
			return [];
		}
	}

	function initFilter(pluginContainer) {
		const categories = parseCategories(pluginContainer);
		const filterBar = pluginContainer.find('.rc-filter-bar');

		// Hide filter if fewer than 2 categories
		if (categories.length < 2) {
			filterBar.addClass('d-none');
			return false;
		}

		const allCids = categories.map(c => c.cid);

		buildDropdown(pluginContainer, categories, null);

		// Bind events (use .off first to prevent duplicates from ajaxify)
		pluginContainer.off('.rcFilter');

		// Toggle dropdown
		pluginContainer.on('click.rcFilter', '.rc-filter-btn', function (e) {
			e.stopPropagation();
			const isOpen = !pluginContainer.find('.rc-filter-dropdown').hasClass('d-none');
			closeAllDropdowns();
			if (!isOpen) {
				openDropdown(pluginContainer);
			}
		});

		// Checkbox change (debounced — user may click multiple checkboxes rapidly)
		let filterTimeout;
		pluginContainer.on('change.rcFilter', '.rc-filter-option input[type="checkbox"]', function () {
			clearTimeout(filterTimeout);
			filterTimeout = setTimeout(function () {
				const selected = [];
				pluginContainer.find('.rc-filter-option input:checked').each(function () {
					selected.push(parseInt($(this).attr('data-cid'), 10));
				});
				applyFilter(pluginContainer, selected, categories);
			}, 300);
		});

		// Clear all (from dropdown header) — uncheck everything = show all (last 20)
		pluginContainer.on('click.rcFilter', '.rc-clear-all', function (e) {
			e.stopPropagation();
			pluginContainer.find('.rc-filter-option input').prop('checked', false);
			applyFilter(pluginContainer, [], categories);
		});

		// Init slick with default cards (all categories, last 20)
		initSlick(pluginContainer.find('.recent-cards'));
	}

	function setupWidget(pluginContainer) {
		initFilter(pluginContainer);
	}

	// Close dropdown on outside click & Escape
	function bindGlobalHandlers() {
		$(document).off('.rcFilter');

		$(document).on('click.rcFilter', function (e) {
			if (!$(e.target).closest('.rc-filter-wrapper').length) {
				closeAllDropdowns();
			}
		});

		$(document).on('keydown.rcFilter', function (e) {
			if (e.key === 'Escape') {
				closeAllDropdowns();
			}
		});
	}

	// Initialize
	bindGlobalHandlers();
	$('.recent-cards-plugin').each(function () {
		setupWidget($(this));
	});

	$(window).on('action:ajaxify.contentLoaded', function () {
		bindGlobalHandlers();
		$('.recent-cards-plugin').each(function () {
			setupWidget($(this));
		});
	});
});
