(() => {
  const toast = document.querySelector('.toast');
  let toastTimer;
  let paymentRow = null;
  let editingUserRow = null;
  let attendanceEvent = null;

  let currentUser = '';
  try { currentUser = sessionStorage.getItem('aylluUserName') || ''; } catch {}
  if (currentUser) {
    document.querySelectorAll('[data-user-display]').forEach((element) => { element.textContent = currentUser; });
    const firstName = document.querySelector('[data-user-first-name]');
    if (firstName) firstName.textContent = currentUser.trim().split(/\s+/)[0];
  }

  document.querySelectorAll('[data-logout]').forEach((link) => {
    link.addEventListener('click', () => { try { sessionStorage.removeItem('aylluUserName'); } catch {} });
  });

  document.querySelectorAll('[data-auth-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const error = form.querySelector('[data-auth-error]');
      if (form.dataset.authForm === 'register' && data.password !== data.confirm) {
        if (error) error.textContent = 'Las contraseñas no coinciden.';
        return;
      }
      const name = form.dataset.authForm === 'register' ? data.name : data.email.split('@')[0];
      try { sessionStorage.setItem('aylluUserName', name.trim()); } catch {}
      window.location.href = document.body.dataset.homeUrl;
    });
  });

  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  document.querySelectorAll('[data-open-modal]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.openModal);
      if (dialog?.id === 'user-modal') {
        editingUserRow = null;
        dialog.querySelector('form')?.reset();
        refreshRoleFields();
        const heading = dialog.querySelector('.modal-head h2');
        if (heading) heading.textContent = 'Agregar usuario';
      }
      if (dialog?.showModal) dialog.showModal();
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog')?.close());
  });
  const userRoleSelect = document.getElementById('user-role');
  const playerAssociationField = document.querySelector('[data-player-association]');
  function refreshRoleFields() {
    const isCoach = userRoleSelect?.value === 'Entrenador';
    const isGuardian = userRoleSelect?.value === 'Apoderado';
    const scope = document.getElementById('user-scope');
    const player = document.getElementById('user-player');
    if (scope) scope.required = isCoach;
    if (player) player.required = isGuardian;
    if (playerAssociationField) playerAssociationField.style.display = isGuardian ? 'grid' : 'none';
  }
  userRoleSelect?.addEventListener('change', refreshRoleFields);
  refreshRoleFields();

  function updateTable(table) {
    if (!table) return;
    const search = document.querySelector(`[data-filter-search="${table.id}"]`);
    const select = document.querySelector(`[data-filter-select="${table.id}"]`);
    const needle = (search?.value || '').trim().toLocaleLowerCase('es');
    const selected = select?.value || '';
    const rows = [...table.querySelectorAll('tbody tr')];
    let visible = 0;
    rows.forEach((row) => {
      const matchesText = row.textContent.toLocaleLowerCase('es').includes(needle);
      const selectedValue = row.dataset.category || row.dataset.status || row.dataset.role || '';
      const matchesSelect = !selected || selectedValue === selected;
      row.hidden = !(matchesText && matchesSelect);
      if (!row.hidden) visible += 1;
    });
    const empty = document.getElementById(table.id.replace('-table', '-empty'));
    if (empty) empty.style.display = visible ? 'none' : 'block';
    if (table.id === 'players-table') {
      const count = document.getElementById('visible-count');
      if (count) count.textContent = visible;
    }
    if (table.id === 'users-table') {
      const count = document.getElementById('users-visible-count');
      if (count) count.textContent = visible;
    }
  }
  document.querySelectorAll('[data-filter-search]').forEach((input) => {
    input.addEventListener('input', () => updateTable(document.getElementById(input.dataset.filterSearch)));
  });
  document.querySelectorAll('[data-filter-select]').forEach((select) => {
    select.addEventListener('change', () => updateTable(document.getElementById(select.dataset.filterSelect)));
  });
  const playerCategoryFilter = document.querySelector('[data-filter-select="players-table"]');
  const requestedCategory = new URLSearchParams(window.location.search).get('categoria');
  if (playerCategoryFilter && requestedCategory && [...playerCategoryFilter.options].some((option) => option.value === requestedCategory || option.textContent === requestedCategory)) {
    playerCategoryFilter.value = requestedCategory;
    updateTable(document.getElementById('players-table'));
  }

  function attachUserEditor(button) {
    if (!button) return;
    button.addEventListener('click', () => {
      editingUserRow = button.closest('tr');
      const modal = document.getElementById('user-modal');
      const form = modal?.querySelector('form');
      if (!editingUserRow || !form) return;
      form.elements.name.value = editingUserRow.querySelector('.player-name')?.textContent || '';
      form.elements.email.value = editingUserRow.querySelector('.muted')?.textContent || '';
      form.elements.role.value = editingUserRow.dataset.role;
      const scope = editingUserRow.cells[2].textContent;
      form.elements.scope.value = [...form.elements.scope.options].some((option) => option.value === scope || option.textContent === scope) ? scope : 'No aplica';
      refreshRoleFields();
      if (editingUserRow.dataset.role === 'Apoderado' && form.elements.player) form.elements.player.value = scope;
      const heading = modal.querySelector('.modal-head h2');
      if (heading) heading.textContent = 'Editar permisos';
      modal.showModal();
    });
  }
  document.querySelectorAll('[data-edit-user]').forEach(attachUserEditor);

  document.querySelectorAll('[data-day-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-day-filter]').forEach((day) => day.classList.remove('selected'));
      button.classList.add('selected');
      const day = button.dataset.dayFilter;
      document.querySelectorAll('#event-list .event-card').forEach((event) => {
        const category = document.getElementById('event-category-filter')?.value || '';
        const matchesCategory = !category || event.dataset.category === category || event.dataset.category === 'Todas';
        event.hidden = event.dataset.eventDay !== day || !matchesCategory;
      });
      const shown = [...document.querySelectorAll('#event-list .event-card')].filter((event) => !event.hidden).length;
      const empty = document.getElementById('events-empty');
      if (empty) empty.style.display = shown ? 'none' : 'block';
      const label = document.getElementById('agenda-label');
      if (label) label.textContent = `${shown} actividad${shown === 1 ? '' : 'es'} para este día`;
    });
  });
  const categoryFilter = document.getElementById('event-category-filter');
  categoryFilter?.addEventListener('change', () => {
    const selectedDay = document.querySelector('[data-day-filter].selected')?.dataset.dayFilter;
    document.querySelectorAll('#event-list .event-card').forEach((event) => {
      const matchesCategory = !categoryFilter.value || event.dataset.category === categoryFilter.value || event.dataset.category === 'Todas';
      event.hidden = (selectedDay && event.dataset.eventDay !== selectedDay) || !matchesCategory;
    });
    const shown = [...document.querySelectorAll('#event-list .event-card')].filter((event) => !event.hidden).length;
    const empty = document.getElementById('events-empty');
    if (empty) empty.style.display = shown ? 'none' : 'block';
    const label = document.getElementById('agenda-label');
    if (label) label.textContent = `${shown} actividad${shown === 1 ? '' : 'es'} para este día`;
  });
  document.querySelector('[data-day-filter].selected')?.click();

  const playerForm = document.querySelector('[data-form-action="player"]');
  const birthField = document.getElementById('player-birth');
  const genderField = document.getElementById('player-gender');
  const categoryField = document.getElementById('player-category');
  const categoryHint = document.getElementById('category-hint');
  function suggestPlayerCategory() {
    if (!birthField || !categoryField || !playerForm) return;
    if (!birthField.value) {
      categoryField.value = '';
      if (categoryHint) categoryHint.textContent = 'Ingresa la fecha de nacimiento para calcular la categoría.';
      return;
    }
    const age = Number(playerForm.dataset.seasonYear || 2026) - Number(birthField.value.slice(0, 4));
    const gender = genderField?.value || '';
    let suggested = '';
    if (age >= 6 && age <= 11) suggested = 'U11 Mixto';
    else if (age >= 12 && age <= 13 && gender) suggested = `U13 ${gender}`;
    else if (age >= 14 && age <= 15 && gender) suggested = `U15 ${gender}`;
    else if (age >= 16 && age <= 17 && gender) suggested = `U17 ${gender}`;
    else if (age >= 18 && age <= 21) suggested = 'U21 / Sub-21';
    else if (age >= 22 && age <= 23 && gender === 'Varones') suggested = 'U23 Varones';
    else if (age >= 24 && age <= 34 && gender === 'Varones') suggested = 'Varones TC';
    else if (age >= 35 && gender === 'Varones') suggested = 'Máx 35+ Varones';
    categoryField.value = suggested;
    if (categoryHint) {
      categoryHint.textContent = suggested
        ? `Categoría sugerida para la temporada ${playerForm.dataset.seasonYear || 2026}: ${suggested}.`
        : 'La categoría para esta edad o división debe definirse con la administración.';
    }
  }
  birthField?.addEventListener('change', suggestPlayerCategory);
  genderField?.addEventListener('change', suggestPlayerCategory);
  const activityForm = document.querySelector('[data-form-action="event"]');
  const activityTypeField = activityForm?.elements.type;
  function syncTrainingFields() {
    const isTraining = activityTypeField?.value === 'Entrenamiento';
    const objective = activityForm?.elements.objective;
    const description = activityForm?.elements.description;
    if (objective) objective.required = isTraining;
    if (description) description.required = isTraining;
    const objectiveLabel = objective?.closest('.form-field')?.querySelector('label');
    const descriptionLabel = description?.closest('.form-field')?.querySelector('label');
    if (objectiveLabel) objectiveLabel.textContent = isTraining ? 'Objetivo' : 'Objetivo (opcional)';
    if (descriptionLabel) descriptionLabel.textContent = isTraining ? 'Descripción' : 'Descripción (opcional)';
  }
  activityTypeField?.addEventListener('change', syncTrainingFields);
  syncTrainingFields();

  const attendanceModal = document.getElementById('attendance-modal');
  const attendanceRoster = document.getElementById('attendance-roster');
  const sampleRoster = [
    { name: 'Matías López', category: 'U11 Mixto' },
    { name: 'Sofía Rojas', category: 'U11 Mixto' },
    { name: 'Diego Ramírez', category: 'U13 Varones' },
    { name: 'Agustina Vera', category: 'U13 Damas' },
    { name: 'Tomás Herrera', category: 'U15 Varones' },
    { name: 'Catalina Díaz', category: 'U15 Damas' }
  ];
  function addAttendanceButton(card) {
    if (!card || card.dataset.type !== 'Entrenamiento' || card.querySelector('[data-take-attendance]')) return;
    const description = card.children[1];
    if (!description) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'btn btn-light btn-sm attendance-action'; button.dataset.takeAttendance = '';
    button.textContent = 'Registrar asistencia';
    description.append(button);
  }
  document.querySelectorAll('#event-list .event-card').forEach(addAttendanceButton);
  document.getElementById('event-list')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-take-attendance]');
    if (!button) return;
    attendanceEvent = button.closest('.event-card');
    const title = attendanceEvent.querySelector('.event-title')?.textContent || 'Entrenamiento';
    const category = attendanceEvent.dataset.category;
    const titleNode = attendanceModal?.querySelector('[data-attendance-title]');
    const categoryNode = attendanceModal?.querySelector('[data-attendance-category]');
    if (titleNode) titleNode.textContent = title;
    if (categoryNode) categoryNode.textContent = category;
    if (attendanceRoster) {
      attendanceRoster.replaceChildren();
      const players = sampleRoster.filter((player) => player.category === category);
      if (!players.length) {
        const empty = document.createElement('p'); empty.className = 'form-hint'; empty.textContent = 'No hay jugadores vinculados a esta categoría en la nómina actual.'; attendanceRoster.append(empty);
      } else {
        players.forEach((player, index) => {
          const label = document.createElement('label'); label.className = 'attendance-row';
          const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'attendee'; input.value = player.name;
          const name = document.createElement('span'); name.textContent = player.name;
          label.append(input, name); attendanceRoster.append(label);
        });
      }
    }
    attendanceModal?.showModal();
  });

  document.querySelectorAll('[data-pay]').forEach((button) => {
    button.addEventListener('click', () => {
      paymentRow = button.closest('tr');
      const playerInput = document.getElementById('payment-player');
      if (playerInput) playerInput.value = button.dataset.pay;
      document.getElementById('payment-modal')?.showModal();
    });
  });

  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase('es') || '').join('');
  document.querySelectorAll('[data-form-action]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const kind = form.dataset.formAction;

      if (kind === 'player') {
        if (!data.category) {
          notify('Define la categoría antes de guardar la inscripción.');
          return;
        }
        const table = document.querySelector('#players-table tbody');
        if (table) {
          const row = document.createElement('tr');
          row.dataset.category = data.category;
          const cells = [
            `<span class="player-cell"><span class="player-avatar"></span><span><span class="player-name"></span><br><span class="muted">Nueva inscripción</span></span></span>`,
            `<span class="badge badge-neutral"></span>`,
            `<span></span><br><span class="muted"></span>`,
            '—', '<span class="badge badge-blue">Por asignar</span>', '<span class="badge badge-yellow">Por revisar</span>', '<button class="icon-btn" title="Ver ficha"><i class="bi bi-arrow-up-right"></i></button>'
          ];
          cells.forEach((html) => { const td = document.createElement('td'); td.innerHTML = html; row.append(td); });
          row.cells[0].querySelector('.player-avatar').textContent = initials(data.name);
          row.cells[0].querySelector('.player-name').textContent = data.name;
          row.cells[1].querySelector('.badge').textContent = data.category;
          row.cells[2].querySelector('span').textContent = data.guardian;
          row.cells[2].querySelector('.muted').textContent = data.phone;
          table.prepend(row);
          const total = document.querySelector('[data-total-players]');
          if (total) total.textContent = Number(total.textContent) + 1;
          updateTable(document.getElementById('players-table'));
        }
        notify('Inscripción agregada.');
      }

      if (kind === 'user') {
        const table = document.querySelector('#users-table tbody');
        const roleSummary = { Presidente: 'Resumen del club', Tesorera: 'Pagos y mensualidades', Secretaria: 'Inscripciones y agenda' };
        const assignedScope = data.role === 'Apoderado' ? data.player : data.role === 'Entrenador' ? data.scope : roleSummary[data.role];
        const roleTone = { Presidente: 'badge-blue', Tesorera: 'badge-yellow', Secretaria: 'badge-neutral', Entrenador: 'badge-green', Apoderado: 'badge-neutral' }[data.role] || 'badge-neutral';
        if (editingUserRow) {
          editingUserRow.dataset.role = data.role;
          const roleBadge = editingUserRow.cells[1].querySelector('.badge');
          roleBadge.className = `badge ${roleTone}`;
          roleBadge.textContent = data.role;
          editingUserRow.cells[2].textContent = assignedScope;
          editingUserRow = null;
          notify('Permisos actualizados.');
        } else if (table) {
          const row = document.createElement('tr'); row.dataset.role = data.role;
          const person = document.createElement('td'); person.innerHTML = '<div class="player-cell"><span class="player-avatar"></span><span><span class="player-name"></span><br><span class="muted"></span></span></div>';
          person.querySelector('.player-avatar').textContent = initials(data.name);
          person.querySelector('.player-name').textContent = data.name;
          person.querySelector('.muted').textContent = data.email;
          const role = document.createElement('td'); const badge = document.createElement('span'); badge.className = `badge ${roleTone}`; badge.textContent = data.role; role.append(badge);
          const scope = document.createElement('td'); scope.textContent = assignedScope;
          const status = document.createElement('td'); status.innerHTML = '<span class="badge badge-green">Activo</span>';
          const action = document.createElement('td'); action.innerHTML = '<button class="icon-btn" title="Cambiar rol" data-edit-user><i class="bi bi-pencil"></i></button>';
          row.append(person, role, scope, status, action); table.prepend(row);
          const total = document.querySelector('[data-user-count]');
          if (total) total.textContent = Number(total.textContent) + 1;
          attachUserEditor(action.querySelector('[data-edit-user]'));
          updateTable(document.getElementById('users-table'));
          notify('Usuario agregado.');
        }
      }

      if (kind === 'category') {
        const group = [...document.querySelectorAll('[data-category-group]')].find((section) => section.dataset.categoryGroup === data.group);
        const grid = group?.querySelector('.grid-3') || document.getElementById('category-grid');
        if (grid) {
          const card = document.createElement('article');
          card.className = 'card category-card';
          card.dataset.categoryName = data.name;
          const top = document.createElement('div'); top.className = 'category-top';
          top.innerHTML = '<span class="category-mark"><i class="bi bi-basket2"></i></span><span class="badge badge-blue">Nueva</span>';
          const title = document.createElement('h2'); title.textContent = data.name;
          const age = document.createElement('div'); age.className = 'category-age'; age.textContent = data.group;
          const detail = document.createElement('p'); detail.className = 'category-detail'; detail.textContent = data.competition || 'Competencia por definir';
          const info = document.createElement('div'); info.className = 'category-info';
          const players = document.createElement('span'); players.innerHTML = '<i class="bi bi-people"></i> Nómina por vincular';
          const schedule = document.createElement('span'); schedule.innerHTML = '<i class="bi bi-clock"></i> Horario por definir';
          const coach = document.createElement('span'); coach.innerHTML = '<i class="bi bi-person-badge"></i> ';
          coach.append(document.createTextNode(data.coach || 'Entrenador por asignar'));
          info.append(players, schedule, coach);
          [top, title, age, detail, info].forEach((node) => card.append(node));
          grid.append(card);
          const total = document.querySelector('[data-category-count]');
          if (total) total.textContent = Number(total.textContent) + 1;
        }
        notify('Categoría creada.');
      }

      if (kind === 'event') {
        const list = document.getElementById('event-list');
        if (list) {
          const date = new Date(`${data.date}T12:00:00`);
          const days = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
          const day = days[date.getDay()];
          const card = document.createElement('article'); card.className = 'event-card'; card.dataset.eventDay = day; card.dataset.category = data.category; card.dataset.type = data.type;
          const time = document.createElement('div'); time.className = 'event-time'; time.textContent = data.time;
          const description = document.createElement('div');
          const title = document.createElement('div'); title.className = 'event-title'; title.textContent = data.title;
          const meta = document.createElement('div'); meta.className = 'event-meta'; meta.innerHTML = '<i class="bi bi-geo-alt"></i> ';
          meta.append(document.createTextNode(`${data.place} · ${data.category}`));
          description.append(title, meta);
          if (data.objective) { const objective = document.createElement('span'); objective.className = 'event-objective'; objective.textContent = `Objetivo: ${data.objective}`; description.append(objective); }
          if (data.description) { const details = document.createElement('p'); details.className = 'event-description'; details.textContent = data.description; description.append(details); }
          const type = document.createElement('span'); type.className = `event-type${data.type === 'Partido' ? ' partido' : ''}`; type.textContent = `${data.type} · ${data.category}`;
          card.append(time, description, type); list.append(card); addAttendanceButton(card);
          const count = document.querySelector('[data-event-count]');
          if (count) count.textContent = Number(count.textContent) + 1;
          document.querySelector('[data-day-filter].selected')?.click();
        }
        notify('Actividad añadida a la agenda.');
      }

      if (kind === 'attendance') {
        const attendees = new FormData(form).getAll('attendee');
        if (attendanceEvent) {
          const button = attendanceEvent.querySelector('[data-take-attendance]');
          if (button) { button.textContent = `Asistencia guardada · ${attendees.length}`; button.classList.remove('btn-light'); button.classList.add('btn-primary'); }
          notify(`Asistencia registrada: ${attendees.length} presente${attendees.length === 1 ? '' : 's'}.`);
        }
        attendanceEvent = null;
      }

      if (kind === 'payment') {
        if (!paymentRow) {
          const name = (data.player || '').trim().toLocaleLowerCase('es');
          paymentRow = [...document.querySelectorAll('#payments-table tbody tr')].find((row) =>
            row.dataset.status === 'Pendiente' && row.cells[0].textContent.toLocaleLowerCase('es').includes(name)
          ) || null;
        }
        if (!paymentRow) {
          notify('Selecciona un jugador con pago pendiente.');
          return;
        }
        const today = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }).replace('.', '');
        if (paymentRow) {
          paymentRow.dataset.status = 'Pagado';
          paymentRow.querySelector('.payment-badge').className = 'badge badge-green payment-badge';
          paymentRow.querySelector('.payment-badge').textContent = 'Pagado';
          paymentRow.querySelector('.payment-date').textContent = today;
          paymentRow.querySelector('.payment-method').textContent = data.method;
          const action = paymentRow.querySelector('[data-pay]');
          if (action) { action.className = 'icon-btn'; action.removeAttribute('data-pay'); action.innerHTML = '<i class="bi bi-check2-circle"></i>'; action.title = 'Pago registrado'; }
          const pending = document.querySelector('[data-pending]');
          if (pending) pending.textContent = Math.max(0, Number(pending.textContent) - 1);
          const raised = document.querySelector('[data-raised]');
          if (raised) {
            const currentRaised = Number(raised.textContent.replace('$', '').replace(' M', '').replace(',', '.')) || 0;
            raised.textContent = `$${(currentRaised + Number(data.amount || 0) / 1000000).toFixed(2).replace('.', ',')} M`;
          }
          const rate = document.querySelector('[data-paid-rate]');
          if (rate && pending) rate.textContent = `${Math.round((140 - Number(pending.textContent)) / 140 * 100)}%`;
          updateTable(document.getElementById('payments-table'));
          notify(`Pago de ${data.player} registrado.`);
        } else {
          notify('Completa los datos del pago.');
        }
        paymentRow = null;
      }

      form.closest('dialog')?.close();
      form.reset();
    });
  });

  document.querySelectorAll('[data-player-detail]').forEach((button) => {
    button.addEventListener('click', () => notify(button.dataset.playerDetail));
  });
  updateTable(document.getElementById('players-table'));
  updateTable(document.getElementById('payments-table'));
})();