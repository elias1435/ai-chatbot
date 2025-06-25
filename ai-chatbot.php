<?php
/**
 * Plugin Name: AI Chatbot
 * Description: A simple interactive chatbot for specific pages.
 * Version: 1.0
 * Author: Muhammad Elias
 * Author URI: https://thebrightclick.co.uk
 */

// Register Admin Menu
add_action('admin_menu', 'ai_chatbot_admin_menu');
function ai_chatbot_admin_menu() {
    // Top-level Menu
    add_menu_page(
        'AI Chatbot',
        'AI Chatbot',
        'manage_options',
        'ai-chatbot-main',
        '',
        'dashicons-format-chat',
        60
    );

    add_submenu_page(
        'ai-chatbot-main',
        'Pre-Defined',
        'Pre-Defined',
        'manage_options',
        'edit-tags.php?taxonomy=predefined&post_type=chatbot_prompt'
    );

    add_submenu_page(
        'ai-chatbot-main',
        'Settings',
        'Settings',
        'manage_options',
        'ai-chatbot-settings',
        'ai_chatbot_settings_page'
    );
}



add_action('admin_head', function() {
    echo '<style>
        #adminmenu .toplevel_page_ai-chatbot-main .wp-menu-image:before {
            content: "🤖";
            font-family: "Segoe UI Emoji", "Apple Color Emoji", sans-serif !important;
            font-size: 18px;
        }
        #adminmenu .toplevel_page_ai-chatbot-main .wp-menu-image img {
            display: none;
        }
    </style>';
});

// Chatbot Prompt
function ai_chatbot_register_prompts_cpt() {
    register_post_type('chatbot_prompt', array(
        'labels' => array(
            'name' => 'Chatbot Prompts',
            'singular_name' => 'Chatbot Prompt',
            'add_new_item' => 'Add New Prompt',
            'edit_item' => 'Edit Prompt',
            'new_item' => 'New Prompt',
            'view_item' => 'View Prompt',
            'search_items' => 'Search Prompts',
        ),
		'public' => true,
		'has_archive' => true,
		'rewrite' => array('slug' => 'prompts'), // custom URL if needed
		'supports' => array('title', 'editor'),
		'show_in_rest' => true,
		'show_in_menu' => 'ai-chatbot-main',
    ));
}

// Register CPT on every page load
add_action('init', 'ai_chatbot_register_prompts_cpt');

// Flush only on activation
register_activation_hook(__FILE__, function () {
    ai_chatbot_register_prompts_cpt();
    flush_rewrite_rules();
});

// Optional: Flush on deactivation
register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});

add_action('admin_enqueue_scripts', 'ai_chatbot_admin_scripts');
function ai_chatbot_admin_scripts($hook) {
    // Debug the hook
    // error_log('Hook fired: ' . $hook);

    if (strpos($hook, 'ai-chatbot-settings') !== false) {
        wp_enqueue_media();
        wp_enqueue_script(
            'ai-chatbot-admin-js',
            plugin_dir_url(__FILE__) . 'assets/js/admin.js',
            ['jquery'],
            filemtime(plugin_dir_path(__FILE__) . 'assets/js/admin.js'),
            true
        );

        // Color Picker
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');

        wp_add_inline_script('wp-color-picker', "
            jQuery(document).ready(function($){
                console.log('🎨 Initializing color picker...');
                $('.ai-chatbot-color-field').wpColorPicker();
            });
        ");
    }
}


// Register Settings
add_action('admin_init', function () {
    register_setting('ai_chatbot_settings_group', 'ai_chatbot_options');
    add_settings_section('ai_chatbot_main_section', '', null, 'ai-chatbot');
    add_settings_field('chat_logo', 'Chat Header Logo', 'ai_chat_logo_callback', 'ai-chatbot', 'ai_chatbot_main_section');
    add_settings_field('bot_name', 'Bot Name', 'ai_bot_name_callback', 'ai-chatbot', 'ai_chatbot_main_section');
    add_settings_field('send_button_text', 'Send Button Text', 'ai_send_btn_callback', 'ai-chatbot', 'ai_chatbot_main_section');
    add_settings_field('toggle_button_text', 'Toggle Button Text', 'ai_toggle_btn_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('welcome_msg_1', 'Welcome Message 1', 'ai_welcome_msg_1_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('welcome_msg_2', 'Welcome Message 2 (Optional)', 'ai_welcome_msg_2_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('welcome_msg_3', 'Welcome Message 3', 'ai_welcome_msg_3_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('welcome_msg_4', 'Welcome Message 4', 'ai_welcome_msg_4_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('name_greeting', 'Greeting After Name', 'ai_name_greeting_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('assist_offer', 'Offer to Help', 'ai_assist_offer_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('name_retry', 'Retry Name Prompt', 'ai_name_retry_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('contact_number', 'Contact Number', 'ai_contact_number_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('contact_email', 'Email Address', 'ai_contact_email_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	
	add_settings_field('primary_color', 'Primary Color', 'ai_primary_color_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('hover_color', 'Hover Color', 'ai_hover_color_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('body_font_size', 'Body Font Size (px)', 'ai_body_font_size_callback', 'ai-chatbot', 'ai_chatbot_main_section');
	add_settings_field('heading_font_size', 'Heading Font Size (px)', 'ai_heading_font_size_callback', 'ai-chatbot', 'ai_chatbot_main_section');
});

// Callbacks
// function ai_chat_logo_callback() {
//     $options = get_option('ai_chatbot_options');
//     $logo = esc_url($options['chat_logo'] ?? '');
//     echo "<input type='text' name='ai_chatbot_options[chat_logo]' id='chat_logo' value='$logo' style='width: 300px;' />";
//     echo "<input type='button' class='button' value='Select Image' id='chat_logo_button' />";
//     if ($logo) {
//         echo "<div><img id='chat_logo_preview' src='$logo' style='max-width: 150px; margin-top: 10px;'/></div>";
//     }
// }

function ai_chat_logo_callback() {
    $options = get_option('ai_chatbot_options');
    $logo = esc_url($options['chat_logo'] ?? '');

    // Input and select button inline
    echo "<div style='display: flex; gap: 10px; align-items: center; margin-bottom: 10px;'>";
    echo "<input type='text' name='ai_chatbot_options[chat_logo]' id='chat_logo' value='$logo' style='width: 300px;' />";
    echo "<input type='button' class='button' value='Select Image' id='chat_logo_button' />";
    echo "</div>";

    // Image preview below in natural flow
    echo "<div id='chat_logo_preview_wrapper' style='margin-top: 10px;" . ($logo ? '' : ' display:none;') . "'>";
    echo "  <div style='position: relative; display: inline-block;'>";
    echo "    <img id='chat_logo_preview' src='$logo' style='max-width: 150px;' />";
    echo "    <button type='button' id='chat_logo_remove' style='
                position: absolute;
                top: -8px;
                right: -8px;
                background: #c00;
                color: #fff;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-weight: bold;
                cursor: pointer;
            '>&times;</button>";
    echo "  </div>";
    echo "</div>";
}


function ai_bot_name_callback() {
    $options = get_option('ai_chatbot_options');
    $value = esc_attr($options['bot_name'] ?? 'TBC AI');
    echo "<input type='text' name='ai_chatbot_options[bot_name]' value='$value' style='width: 300px;' />";
}

function ai_send_btn_callback() {
    $options = get_option('ai_chatbot_options');
    $value = esc_attr($options['send_button_text'] ?? 'Send');
    echo "<input type='text' name='ai_chatbot_options[send_button_text]' value='$value' style='width: 300px;' />";
}

function ai_toggle_btn_callback() {
    $options = get_option('ai_chatbot_options');
    $value = esc_attr($options['toggle_button_text'] ?? 'Ask Me Anything');
    echo "<input type='text' name='ai_chatbot_options[toggle_button_text]' value='$value' style='width: 300px;' />";
}

function ai_welcome_msg_1_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['welcome_msg_1'] ?? 'Hello, Welcome to');
    echo "<input type='text' name='ai_chatbot_options[welcome_msg_1]' value='$val' style='width: 300px;' />";
}

function ai_welcome_msg_2_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['welcome_msg_2'] ?? '');
    echo "<input type='text' name='ai_chatbot_options[welcome_msg_2]' value='$val' style='width: 300px;' />";
}

function ai_welcome_msg_3_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['welcome_msg_3'] ?? 'My name is');
    echo "<input type='text' name='ai_chatbot_options[welcome_msg_3]' value='$val' style='width: 300px;' />";
}

function ai_welcome_msg_4_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['welcome_msg_4'] ?? 'May I know your name?');
    echo "<input type='text' name='ai_chatbot_options[welcome_msg_4]' value='$val' style='width: 300px;' />";
}

function ai_name_greeting_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['name_greeting'] ?? 'Nice to meet you');
    echo "<input type='text' name='ai_chatbot_options[name_greeting]' value='$val' style='width: 300px;' />";
}

function ai_assist_offer_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['assist_offer'] ?? 'How can I help you?');
    echo "<input type='text' name='ai_chatbot_options[assist_offer]' value='$val' style='width: 300px;' />";
}

function ai_name_retry_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['name_retry'] ?? "Sorry, I didn't catch your name. Can you say it again?");
    echo "<input type='text' name='ai_chatbot_options[name_retry]' value='$val' style='width: 300px;' />";
}

function ai_contact_number_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['contact_number'] ?? '');
    echo "<input type='text' name='ai_chatbot_options[contact_number]' value='$val' style='width: 300px;' />";
}

function ai_contact_email_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['contact_email'] ?? '');
    echo "<input type='email' name='ai_chatbot_options[contact_email]' value='$val' style='width: 300px;' />";
}

function ai_primary_color_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['primary_color'] ?? '#000000');
    echo "<input type='text' class='ai-chatbot-color-field' name='ai_chatbot_options[primary_color]' value='$val' />";
}

function ai_hover_color_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['hover_color'] ?? '#c36');
    echo "<input type='text' class='ai-chatbot-color-field' name='ai_chatbot_options[hover_color]' value='$val' />";
}

function ai_body_font_size_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['body_font_size'] ?? '14');
    echo "<input type='number' name='ai_chatbot_options[body_font_size]' value='$val' min='1' /> px";
}

function ai_heading_font_size_callback() {
    $options = get_option('ai_chatbot_options');
    $val = esc_attr($options['heading_font_size'] ?? '18');
    echo "<input type='number' name='ai_chatbot_options[heading_font_size]' value='$val' min='1' /> px";
}



// Settings Page UI
function ai_chatbot_settings_page() {
    ?>
    <div class="wrap">
        <h1>AI Chatbot Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('ai_chatbot_settings_group');
            do_settings_sections('ai-chatbot');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}





// Only load scripts on these pages
function ai_chatbot_enqueue_assets() {
    $allowed_pages = array(4732); // Add more page IDs as needed

    if (is_page($allowed_pages)) {
        ai_chatbot_enqueue_versioned_file('ai-chatbot-js', 'assets/js/chatbot.js', ['jquery'], true, 'script');
        ai_chatbot_enqueue_versioned_file('ai-chatbot-css', 'assets/css/chatbot.css', [], false, 'style');

		
		// Pre Desined 5 Questions
		$default_prompts = get_posts([
			'post_type' => 'chatbot_prompt',
			'tax_query' => [
				[
					'taxonomy' => 'predefined',
					'field'    => 'slug',
					'terms'    => ['welcome'], // ← match your actual term slug here
				]
			],
			'numberposts' => 5
		]);

		$prompt_data = [];
		foreach ($default_prompts as $post) {
			$prompt_data[] = [
				'id'      => $post->ID,
				'title'   => esc_html($post->post_title),
				'content' => wpautop($post->post_content),
			];
		}
		
        $options = get_option('ai_chatbot_options', []);
		
		wp_localize_script('ai-chatbot-js', 'chatbotAjax', array(
			'ajaxurl'        => admin_url('admin-ajax.php'),
			'pluginurl'      => plugin_dir_url(__FILE__),
			'chat_logo' => !empty($options['chat_logo']) ? $options['chat_logo'] : plugin_dir_url(__FILE__) . 'assets/img/logo.webp',
			'bot_name'       => $options['bot_name'] ?? 'TBC AI',
			'send_button'    => $options['send_button_text'] ?? 'Send',
			'toggle_button'  => $options['toggle_button_text'] ?? 'Ask Me Anything',
			'welcome_msg_1'  => $options['welcome_msg_1'] ?? 'Hello, Welcome to',
			'welcome_msg_2'  => $options['welcome_msg_2'] ?? '',
			'welcome_msg_3'  => $options['welcome_msg_3'] ?? 'My name is',
			'welcome_msg_4'  => $options['welcome_msg_4'] ?? 'May I know your name?',
			'greeting_after_name' => $options['name_greeting'] ?? 'Nice to meet you',
			'assist_offer'        => $options['assist_offer'] ?? 'How can I help you?',
			'name_retry'          => $options['name_retry'] ?? "Sorry, I didn't catch your name. Can you say it again?",
			'contact_email'  => $options['contact_email'] ?? '',
			'contact_number' => $options['contact_number'] ?? '',
			'primary_color'     => $options['primary_color'] ?? '#000000',
			'hover_color'       => $options['hover_color'] ?? '#c36',
			'body_font_size'         => $options['body_font_size'] ?? '14px',
			'heading_font_size' => $options['heading_font_size'] ?? '18px',
			'predefined_prompts' => $prompt_data,
			'blog_name'      => get_bloginfo('name'),
		));
		
		// dynamic CSS
		$custom_css = "
			.bot-label,
			.prompt-toggle {
				background: {$options['primary_color']};
			}
			.prompt-content p,
			.prompt-toggle {
				font-size: {$options['body_font_size']}px;
			}
			.prompt-toggle:focus,
			.prompt-toggle:visited,
			.prompt-toggle:hover {
				background: {$options['hover_color']} !important;
			}
			.chatbot-heading,
			.prompt-content h2,
			.prompt-content h3,
			.prompt-content h4,
			.prompt-content h5,
			.prompt-content h6 {
				font-size: {$options['heading_font_size']}px;
			}
		";
		wp_add_inline_style('ai-chatbot-css', $custom_css);

    }
}
add_action('wp_enqueue_scripts', 'ai_chatbot_enqueue_assets');

// Helper to enqueue versioned assets
function ai_chatbot_enqueue_versioned_file($handle, $relative_path, $deps = [], $in_footer = true, $type = 'script') {
    $file = plugin_dir_path(__FILE__) . $relative_path;
    $url  = plugin_dir_url(__FILE__) . $relative_path;
    $ver  = file_exists($file) ? filemtime($file) : null;

    if ($type === 'script') {
        wp_enqueue_script($handle, $url, $deps, $ver, $in_footer);
    } elseif ($type === 'style') {
        wp_enqueue_style($handle, $url, $deps, $ver);
    }
}

// Chatbot AJAX search logic
function ai_chatbot_search_query() {
    if (!isset($_POST['message'])) {
        wp_send_json_error(['response' => 'Invalid request']);
        wp_die();
    }

    $search_query = sanitize_text_field($_POST['message']);
    $search_query = ai_chatbot_extract_keywords($search_query);

    $args = array(
        'post_type'      => array('chatbot_prompt'),
        'posts_per_page' => 5,
        's'              => $search_query
    );

    $query = new WP_Query($args);
    if ($query->have_posts()) {
        $results = [];
        while ($query->have_posts()) {
            $query->the_post();
            $results[] = '<a href="' . get_permalink() . '" target="_self">' . get_the_title() . '</a>';
        }
        wp_reset_postdata();
        wp_send_json_success(['response' => 'Here are some related articles: <br>' . implode('<br>', $results)]);
    } else {
        wp_send_json_success(['response' => "Sorry, I couldn't find any relevant resources."]);
    }

    wp_die();
}
add_action('wp_ajax_chatbot_search_query', 'ai_chatbot_search_query');
add_action('wp_ajax_nopriv_chatbot_search_query', 'ai_chatbot_search_query');

// Keyword extractor
function ai_chatbot_extract_keywords($text) {
    $text = strtolower($text);
    $text = str_replace("’", "'", $text);
    $text = preg_replace('/[^\w\s\']/', '', $text);

    $stop_words = [
        'what', 'how', 'where', 'about', 'to', 'is', 'a', 'an', 'the', 'can', 'i', 'you',
        'know', 'want', 'need', 'please', 'tell', 'me', 'do', 'does', 'like'
    ];

    $words = explode(" ", $text);
    $filtered = array_diff($words, $stop_words);

    return !empty($filtered) ? implode(" ", $filtered) : $text;
}

// Pre Defined Taxonomy
function ai_chatbot_register_predefined_taxonomy() {
    register_taxonomy('predefined', 'chatbot_prompt', array(
        'label'             => 'Pre-Defined',
        'public'            => true,
        'hierarchical'      => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => 'predefined'),
    ));
}
add_action('init', 'ai_chatbot_register_predefined_taxonomy');


add_action('init', 'ai_chatbot_ensure_welcome_term');
function ai_chatbot_ensure_welcome_term() {
    // Ensure the 'predefined' taxonomy exists before inserting term
    if (taxonomy_exists('predefined')) {
        if (!term_exists('welcome', 'predefined')) {
            wp_insert_term(
                'Welcome',            // Term name
                'predefined',         // Taxonomy
                [
                    'slug' => 'welcome',
                    'description' => 'Default welcome prompts',
                    'parent' => 0       // Only needed if hierarchical parent is needed
                ]
            );
        }
    }
}
